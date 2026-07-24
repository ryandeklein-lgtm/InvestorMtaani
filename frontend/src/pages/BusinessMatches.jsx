import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BusinessMatches() {

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchMatches();
  }, []);


  const fetchMatches = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/matchmaking/business"
      );

      setMatches(response.data.data || []);

    } catch (error) {

      console.error(
        "Error loading matchmaking requests:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load matchmaking requests."
      );

    } finally {
      setLoading(false);
    }
  };



  const handleStatus = async (matchId, status) => {

    try {

      await api.patch(
        `/matchmaking/${matchId}/status`,
        {
          status,
        }
      );


      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match.id === matchId
            ? {
                ...match,
                status,
              }
            : match
        )
      );


    } catch (error) {

      console.error(
        "Error updating matchmaking request:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Unable to update matchmaking request."
      );

    }

  };



  if (loading) {
    return (
      <h2 style={styles.center}>
        Loading matchmaking requests...
      </h2>
    );
  }



  return (

    <div style={styles.page}>

      <div style={styles.container}>

        <BackButton />


        <h1 style={styles.title}>
          🤝 Matchmaking Requests
        </h1>


        <p style={styles.subtitle}>
          Review investors who want to connect with
          your business.
        </p>



        {error && (

          <div style={styles.error}>
            {error}
          </div>

        )}



        {!error && matches.length === 0 && (

          <div style={styles.empty}>

            <h2>
              No matchmaking requests yet
            </h2>


            <p>
              When an investor requests a match
              with your business, it will appear here.
            </p>

          </div>

        )}



        <div style={styles.grid}>

          {matches.map((match) => (

            <div
              key={match.id}
              style={styles.card}
            >


              <div style={styles.cardHeader}>

                <div>

                  <h2 style={styles.investorName}>
                    {match.investor_name ||
                    "Investor"}
                  </h2>


                  <p style={styles.email}>
                    {match.investor_email}
                  </p>

                </div>



                <StatusBadge
                  status={match.status}
                />


              </div>



              <hr style={styles.divider} />



              <p>
                <strong>
                  Business:
                </strong>{" "}
                {match.business_name}
              </p>




              {match.investment_amount && (

                <p>

                  <strong>
                    Proposed Investment:
                  </strong>{" "}

                  KES{" "}
                  {Number(
                    match.investment_amount
                  ).toLocaleString()}

                </p>

              )}




              {match.investment_type && (

                <p>

                  <strong>
                    Investment Type:
                  </strong>{" "}

                  {match.investment_type}

                </p>

              )}




              {match.message && (

                <div style={styles.message}>

                  <strong>
                    Investor Message
                  </strong>


                  <p>
                    {match.message}
                  </p>

                </div>

              )}




              <p style={styles.date}>

                Requested:{" "}

                {new Date(
                  match.created_at
                ).toLocaleDateString()}

              </p>




              {match.status === "pending" && (

                <div style={styles.actions}>


                  <button

                    onClick={() =>
                      handleStatus(
                        match.id,
                        "accepted"
                      )
                    }

                    style={styles.acceptButton}

                  >

                    ✓ Accept Match

                  </button>




                  <button

                    onClick={() =>
                      handleStatus(
                        match.id,
                        "declined"
                      )
                    }

                    style={styles.declineButton}

                  >

                    ✕ Decline

                  </button>


                </div>

              )}



            </div>

          ))}


        </div>


      </div>


    </div>

  );

}




function StatusBadge({ status }) {

  const statusStyles = {

    pending: {
      background:"#fef3c7",
      color:"#92400e",
    },

    accepted:{
      background:"#dcfce7",
      color:"#166534",
    },

    declined:{
      background:"#fee2e2",
      color:"#991b1b",
    },

  };


  return (

    <span

      style={{
        ...styles.statusBadge,
        ...(statusStyles[status] ||
        statusStyles.pending),
      }}

    >

      {status
        ? status.toUpperCase()
        : "PENDING"}

    </span>

  );

}




const styles = {

  page:{
    minHeight:"100vh",
    padding:"40px",
    background:
    "linear-gradient(135deg,#0f2027,#2c5364)",
  },


  container:{
    maxWidth:"1000px",
    margin:"auto",
  },


  title:{
    color:"white",
    fontSize:"42px",
    marginBottom:"10px",
  },


  subtitle:{
    color:"#dbeafe",
    fontSize:"18px",
    marginBottom:"35px",
  },


  grid:{
    display:"grid",
    gap:"20px",
  },


  card:{
    background:"white",
    padding:"30px",
    borderRadius:"18px",
    boxShadow:
    "0 10px 30px rgba(0,0,0,0.25)",
  },


  cardHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-start",
    gap:"20px",
  },


  investorName:{
    margin:0,
  },


  email:{
    color:"#64748b",
  },


  statusBadge:{
    padding:"8px 14px",
    borderRadius:"20px",
    fontSize:"12px",
    fontWeight:"bold",
  },


  divider:{
    margin:"20px 0",
    border:"none",
    borderTop:"1px solid #e2e8f0",
  },


  message:{
    marginTop:"20px",
    padding:"18px",
    background:"#f8fafc",
    borderRadius:"10px",
  },


  date:{
    marginTop:"20px",
    color:"#64748b",
    fontSize:"14px",
  },


  actions:{
    display:"flex",
    gap:"12px",
    marginTop:"25px",
    flexWrap:"wrap",
  },


  acceptButton:{
    padding:"12px 22px",
    border:"none",
    borderRadius:"8px",
    background:"#16a34a",
    color:"white",
    fontWeight:"bold",
    cursor:"pointer",
  },


  declineButton:{
    padding:"12px 22px",
    border:"none",
    borderRadius:"8px",
    background:"#dc2626",
    color:"white",
    fontWeight:"bold",
    cursor:"pointer",
  },


  empty:{
    background:"white",
    padding:"40px",
    borderRadius:"18px",
    textAlign:"center",
  },


  error:{
    background:"#fee2e2",
    color:"#991b1b",
    padding:"18px",
    borderRadius:"10px",
  },


  center:{
    textAlign:"center",
    marginTop:"100px",
  },

};


export default BusinessMatches;