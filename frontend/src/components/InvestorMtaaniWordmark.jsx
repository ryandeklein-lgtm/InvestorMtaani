import "./InvestorMtaaniWordmark.css";

export default function InvestorMtaaniWordmark({ className = "" }) {
  return (
    <span className={`im-wordmark${className ? ` ${className}` : ""}`}>
      <span className="im-wordmark-kicker">INVESTOR</span>
      <strong className="im-wordmark-name">MTAANI</strong>
    </span>
  );
}
