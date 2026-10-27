# Local Investor Mtaani demo data

These businesses, investor organizations, stories, and media are fictional. The images are original synthetic illustrations; the short WebM clip is generated locally by `scripts/generateDemoVideo.js` and contains no real people or business footage.

From the `backend` directory, run the seed only against a local development database:

```powershell
$env:NODE_ENV = "development"
$env:ALLOW_DEMO_SEED = "YES"
npm run seed:demo
```

The seed refuses remote database hosts and will not replace a non-demo account that happens to use one of its reserved `.test` email addresses. It can be rerun to refresh these sample profiles and posts.

Demo accounts all use the shared local-only password `DemoOnly!2026`:

| Role | Email |
| --- | --- |
| Business | `demo.business.kijani@investormtaani.test` |
| Business | `demo.business.market@investormtaani.test` |
| Business | `demo.business.growers@investormtaani.test` |
| Investor | `demo.investor.bahari@investormtaani.test` |
| Investor | `demo.investor.pwani@investormtaani.test` |
| Investor | `demo.investor.rift@investormtaani.test` |

Businesses are marked approved, and investor profiles are marked verified, only so local demo accounts can exercise feed discovery and matchmaking suggestions without entering any real KYC data. The credentials and sample approvals must never be used on a public or production deployment.
