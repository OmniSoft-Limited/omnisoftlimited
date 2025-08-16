"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import "./redoc.css"; // <-- import your global overrides

export default function DocsPage() {
    const redocRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (redocRef.current && (window as any).Redoc) {
            (window as any).Redoc.init(
                "/swagger.json",
                {
                    scrollYOffset: 0,
                    theme: {
                        colors: {
                            primary: { main: "#4F46E5" },
                            text: { main: "#FFFFFF", subText: "#D1D5DB" },
                            gray: { 50: "#1F2937", 100: "#111827" },
                        },
                        sidebar: {
                            backgroundColor: "#111827",
                            textColor: "#FFFFFF",
                            activeTextColor: "#4F46E5",
                        },
                        rightPanel: {
                            backgroundColor: "#1F2937",
                            textColor: "#FFFFFF",
                        },
                        typography: {
                            fontSize: "16px",
                            fontFamily: "Roboto, sans-serif",
                        },
                    },
                    expandResponses: "all",
                    nativeScrollbars: true,
                },
                redocRef.current
            );
        }
    }, []);

    return (
        <div style={{ height: "100vh" }}>
            <Script
                src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"
                strategy="beforeInteractive"
            />
            <div ref={redocRef} />
        </div>
    );
}
