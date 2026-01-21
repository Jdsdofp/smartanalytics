// src/pages/Analytics/Infraestrict/MN0400_132.tsx
import { useState } from "react";
import { MapPinIcon, MapIcon } from "@heroicons/react/24/outline";
import GPSMapViewer from "../../../components/Infraestruct/Map/GPSMapViewer";
import GPSRouteMapLeaflet from "../../../components/Infraestruct/Map/GPSRouteMap";
import Layout from "../../../components/layout/Layout";

type TabType = "viewer" | "route";

export default function MN0400_132() {
    const [activeTab, setActiveTab] = useState<TabType>("viewer");

    return (
        <Layout>
            <div className="flex flex-col h-full bg-gray-50">
                {/* Header com Segmented Control */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
                    <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setActiveTab("viewer")}
                            className={`cursor-pointer
                                flex items-center gap-2 px-4 py-1.5 rounded-lg
                                font-semibold text-sm transition-all duration-300
                                ${activeTab === "viewer"
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                                    : "text-gray-600 hover:text-gray-900"
                                }
                            `}
                        >
                            <MapPinIcon className="w-4 h-4" />
                            <span>Visualização</span>
                        </button>
                        
                        <button
                            onClick={() => setActiveTab("route")}
                            className={`cursor-pointer
                                flex items-center gap-2 px-4 py-1.5 rounded-lg
                                font-semibold text-sm transition-all duration-300
                                ${activeTab === "route"
                                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/30"
                                    : "text-gray-600 hover:text-gray-900"
                                }
                            `}
                        >
                            <MapIcon className="w-4 h-4" />
                            <span>Rotas</span>
                        </button>
                    </div>
                    <p className="font-semibold text-gray-500 inline-flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-gray-500" />
                        GPS Tracking
                    </p>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 overflow-hidden">
                    {activeTab === "viewer" && (
                        <div className="h-full animate-fadeIn">
                            <GPSMapViewer />
                        </div>
                    )}
                    
                    {activeTab === "route" && (
                        <div className="h-full animate-fadeIn">
                            <GPSRouteMapLeaflet />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}