"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
}

export default class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[${this.props.sectionName}] render error`, error);
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-[1600px] rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center">
          <h3 className="text-lg font-bold text-red-700">{this.props.sectionName} is unavailable</h3>
          <p className="mt-2 text-sm text-red-600">A loading error occurred. You can retry this section.</p>
          <button
            onClick={this.reset}
            className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
