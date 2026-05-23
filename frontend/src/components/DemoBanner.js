import './DemoBanner.css';

const IS_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

export default function DemoBanner() {
  if (!IS_MOCK) return null;
  return (
    // <div className="demo-banner">
    //   <span className="demo-dot" />
    //   <strong>DEMO MODE</strong>
    //   &nbsp;— All data is simulated. Login:&nbsp;
    //   <code>demo@energienutrition.com</code> / <code>demo123</code>
    //   &nbsp;·&nbsp;
    //   <span>Admin panel available at&nbsp;<a href="/admin">/admin</a></span>
    // </div>
    []
  );
}
