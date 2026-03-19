import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Cuộn mượt mà
    });
  }, [pathname]);

  return null; // Component này chỉ chạy ngầm, không render ra giao diện
}