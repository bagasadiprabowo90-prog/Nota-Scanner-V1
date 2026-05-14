"use client";
import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-gray-700 font-semibold">Terjadi kesalahan</p>
          <p className="text-gray-400 text-sm mt-1">{this.state.error?.message || "Silakan muat ulang halaman"}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
