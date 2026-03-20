import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "../icons";

function Layout({ sidebar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (desktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div style={{ display: "flex", minheight: "100vh", background: "#000" }}>

        {/* DESKTOP SIDEBAR */}
        {isDesktop && sidebarOpen && (
          <div
            style={{
              width: "260px",
              borderRight: "var(--hover)",
              padding: "16px",
              background: "#111",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Sidebar Header */}
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ☰
              </button>
            </div>

            {sidebar}
          </div>
        )}

        {/* MAIN CONTENT */}
        {/* <div
    style={{
      flex: 1,
      padding: "24px",
      overflowY: "auto",
      position: "relative",
    }}
  > */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          position: "relative",
          padding: "24px"
           }}>
          {/* Floating hamburger when sidebar closed */}
          {isDesktop && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: "absolute",
                left: "10px",
                top: "10px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}

          {/* Mobile top hamburger */}
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                marginBottom: "20px",
                cursor: "pointer",
              }}
            >
              ☰
            </button>
          )}

          {children}
        </div>
      </div>


      {/* OVERLAY SIDEBAR (Tablet + Mobile only) */}
      {!isDesktop && sidebarOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "260px",
              height: "100%",
              background: "#111",
              padding: "16px",
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                marginBottom: "20px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            {sidebar}
          </div>

          {/* Scrim */}
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: "260px",   // IMPORTANT
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 999,
              }}
            />
        </>
      )}

      

    </>
  );
}

export default Layout;
