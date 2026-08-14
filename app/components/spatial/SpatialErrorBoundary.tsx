"use client";

import React, { Component, ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import SectionRegistry from "../SectionRegistry";
import type { HomepageSectionConfig } from "@/app/lib/types";

interface Props {
  children: ReactNode;
  activeSections: HomepageSectionConfig[];
}

interface State {
  hasError: boolean;
}

export default class SpatialErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Spatial Scene Renderer Error — Falling back to Theme 01 Paper Layout:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Safe fallback to Theme 01 Paper Layout stack
      return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <Header />
          <div className="py-4 px-4 bg-amber-500/10 border-b border-amber-500/20 text-center text-xs font-mono text-amber-800">
            Spatial Renderer encountered a rendering boundary exception. Safely switched to Theme 01 Paper Layout.
          </div>
          {this.props.activeSections.map((sec) => (
            <SectionRegistry key={sec.id} section={sec} />
          ))}
          <Footer />
        </div>
      );
    }

    return this.props.children;
  }
}
