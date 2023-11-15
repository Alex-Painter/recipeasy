import React from "react";

const AppFooter = () => {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">FAQ</a>
        <a className="link link-hover">Terms</a>
        <a className="link link-hover">Privacy</a>
      </nav>
      <aside>
        <p>Copyright © 2023 - All right reserved by Omlete</p>
      </aside>
    </footer>
  );
};

export default AppFooter;
