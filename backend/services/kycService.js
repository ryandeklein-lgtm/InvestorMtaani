const path = require("path");
const pool = require("../config/db");
const { encrypt, decrypt } = require("../utils/kycEncryption");

const REQUIRED_DOCUMENTS = {
  business: ["registration_certificate", "ownership_record", "director_id", "tax_document", "financial_statements", "business_plan"],
  investor: ["identity_document", "proof_of_address", "source_of_funds"],
};

const safeName = (name) =>
  path.basename(String(name || "document").replace(/[\x00-\x1f\x7f"\\/]/g, "_")).slice(0, 180);

const createSubmission = async (userId, entityType, answers, files, documentTypes) => {
  if (!REQUIRED_DOCUMENTS[entityType]) throw Object.assign(new Error("Invalid account type."), { status: 400 });
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw Object.assign(new Error("KYC details are required."), { status: 400 });
  const requiredAnswers = entityType === "business"
    ? ["businessName", "registrationNumber", "businessType", "kraPin", "businessAddress", "operatingAddress", "county", "directors", "beneficialOwners", "shareholding"]
    : ["fullName", "investorType", "country", "address", "occupation", "sourceOfFunds"];
  if (requiredAnswers.some((key) => !String(answers[key] || "").trim())) {
    throw Object.assign(new Error("Complete all required KYC details before submitting."), { status: 400 });
  }
  const answersText = JSON.stringify(answers);
  if (Buffer.byteLength(answersText, "utf8") > 64 * 1024) throw Object.assign(new Error("KYC details exceed the size limit."), { status: 400 });
  if (answers.declaration !== true) throw Object.assign(new Error("Please accept the KYC declaration."), { status: 400 });
  if (!Array.isArray(documentTypes) || documentTypes.length !== files.length) throw Object.assign(new Error("Document labels do not match the uploaded files."), { status: 400 });
  const cleanTypes = documentTypes.map((type) => String(type || "").toLowerCase());
  if (cleanTypes.some((type) => !/^[a-z_]{2,48}$/.test(type)) || new Set(cleanTypes).size !== cleanTypes.length) {
    throw Object.assign(new Error("Document labels must be unique and valid."), { status: 400 });
  }
  const missing = REQUIRED_DOCUMENTS[entityType].filter((type) => !cleanTypes.includes(type));
  if (missing.length) throw Object.assign(new Error(`Required documents missing: ${missing.join(", ")}.`), { status: 400 });

  const encryptedAnswers = encrypt(answersText);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const profileTable = entityType === "business" ? "businesses" : "investors";
    const profile = await client.query(`SELECT id FROM ${profileTable} WHERE user_id = $1 FOR UPDATE`, [userId]);
    if (!profile.rowCount) {
      const error = new Error("Create your business or investor profile before submitting KYC.");
      error.status = 409;
      throw error;
    }
    const existing = await client.query(
      `SELECT id FROM kyc_submissions
        WHERE user_id = $1 AND entity_type = $2
          AND status IN ('pending', 'approved')
        ORDER BY created_at DESC LIMIT 1
        FOR UPDATE`,
      [userId, entityType]
    );
    if (existing.rowCount) {
      const error = new Error("A KYC submission is already pending or approved for this account.");
      error.status = 409;
      throw error;
    }
    const result = await client.query(
      `INSERT INTO kyc_submissions
         (user_id, entity_type, status, answers_ciphertext, answers_iv, answers_auth_tag)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING id, status, entity_type, created_at`,
      [userId, entityType, encryptedAnswers.ciphertext, encryptedAnswers.iv, encryptedAnswers.authTag]
    );
    const submission = result.rows[0];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const encryptedFile = encrypt(file.buffer);
      await client.query(
        `INSERT INTO kyc_documents
           (submission_id, document_type, original_name, content_type, size_bytes, ciphertext, iv, auth_tag)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [submission.id, cleanTypes[index], safeName(file.originalname), file.mimetype, file.size, encryptedFile.ciphertext, encryptedFile.iv, encryptedFile.authTag]
      );
    }

    await client.query(
      `INSERT INTO kyc_access_logs (submission_id, actor_user_id, action)
       VALUES ($1, $2, 'submitted')`,
      [submission.id, userId]
    );
    if (entityType === "investor") {
      await client.query("UPDATE investors SET verification_status = 'pending' WHERE user_id = $1", [userId]);
    } else {
      await client.query("UPDATE businesses SET kyc_status = 'pending' WHERE user_id = $1", [userId]);
    }
    await client.query("COMMIT");
    return submission;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getMySubmissions = async (userId) => {
  const result = await pool.query(
    `SELECT s.id, s.entity_type, s.status, s.review_notes, s.created_at, s.reviewed_at,
            (SELECT COUNT(*) FROM kyc_documents d WHERE d.submission_id = s.id) AS document_count
       FROM kyc_submissions s
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const listSubmissionsForAdmin = async (status) => {
  const values = [];
  let where = "";
  if (status) {
    values.push(status);
    where = "WHERE s.status = $1";
  }
  const result = await pool.query(
    `SELECT s.id, s.user_id, s.entity_type, s.status, s.review_notes, s.created_at, s.reviewed_at,
            u.name AS applicant_name, u.email AS applicant_email,
            COALESCE(json_agg(json_build_object(
              'id', d.id, 'type', d.document_type, 'name', d.original_name,
              'contentType', d.content_type, 'size', d.size_bytes
            )) FILTER (WHERE d.id IS NOT NULL), '[]'::json) AS documents
       FROM kyc_submissions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN kyc_documents d ON d.submission_id = s.id
       ${where}
      GROUP BY s.id, u.name, u.email
      ORDER BY s.created_at DESC`,
    values
  );
  return result.rows;
};

const getSubmissionForAdmin = async (submissionId, actorId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT s.*, u.name AS applicant_name, u.email AS applicant_email
         FROM kyc_submissions s JOIN users u ON u.id = s.user_id
        WHERE s.id = $1`,
      [submissionId]
    );
    const submission = result.rows[0];
    if (!submission) {
      await client.query("COMMIT");
      return null;
    }
    const docs = await client.query(
      `SELECT id, document_type, original_name, content_type, size_bytes, created_at
         FROM kyc_documents WHERE submission_id = $1 ORDER BY id`,
      [submissionId]
    );
    await client.query(
      `INSERT INTO kyc_access_logs (submission_id, actor_user_id, action)
       VALUES ($1, $2, 'reviewed')`,
      [submissionId, actorId]
    );
    await client.query("COMMIT");
    const answers = decrypt({
      ciphertext: submission.answers_ciphertext,
      iv: submission.answers_iv,
      authTag: submission.answers_auth_tag,
    }).toString("utf8");
    return {
      id: submission.id,
      userId: submission.user_id,
      entityType: submission.entity_type,
      status: submission.status,
      reviewNotes: submission.review_notes,
      createdAt: submission.created_at,
      applicantName: submission.applicant_name,
      applicantEmail: submission.applicant_email,
      answers: JSON.parse(answers),
      documents: docs.rows,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getDocumentForAdmin = async (submissionId, documentId, actorId) => {
  const result = await pool.query(
    `SELECT d.* FROM kyc_documents d
       JOIN kyc_submissions s ON s.id = d.submission_id
      WHERE d.id = $1 AND d.submission_id = $2`,
    [documentId, submissionId]
  );
  const document = result.rows[0];
  if (!document) return null;
  await pool.query(
    `INSERT INTO kyc_access_logs (submission_id, actor_user_id, action, metadata)
     VALUES ($1, $2, 'document_downloaded', jsonb_build_object('documentId', $3))`,
    [submissionId, actorId, documentId]
  );
  return {
    name: safeName(document.original_name),
    contentType: document.content_type,
    content: decrypt({ ciphertext: document.ciphertext, iv: document.iv, authTag: document.auth_tag }),
  };
};

const reviewSubmission = async (submissionId, actorId, status, reviewNotes) => {
  if (!["approved", "needs_changes", "rejected"].includes(status)) {
    throw Object.assign(new Error("Choose approved, needs changes, or rejected."), { status: 400 });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      `UPDATE kyc_submissions
          SET status = $1, review_notes = $2, reviewed_by = $3,
              reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $4 AND status = 'pending'
        RETURNING user_id, entity_type`,
      [status, reviewNotes || null, actorId, submissionId]
    );
    const submission = updated.rows[0];
    if (!submission) {
      await client.query("ROLLBACK");
      return false;
    }
    const targetTable = submission.entity_type === "investor" ? "investors" : "businesses";
    const targetColumn = submission.entity_type === "investor" ? "verification_status" : "kyc_status";
    await client.query(`UPDATE ${targetTable} SET ${targetColumn} = $1 WHERE user_id = $2`, [status, submission.user_id]);
    await client.query(
      `INSERT INTO kyc_access_logs (submission_id, actor_user_id, action, metadata)
       VALUES ($1, $2, 'decision', jsonb_build_object('status', $3))`,
      [submissionId, actorId, status]
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  listSubmissionsForAdmin,
  getSubmissionForAdmin,
  getDocumentForAdmin,
  reviewSubmission,
};
