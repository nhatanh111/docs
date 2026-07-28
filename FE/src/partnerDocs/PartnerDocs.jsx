import React, { useState, useEffect } from 'react';
import usePartnerDocs from './usePartnerDocs';
import DocsSidebar from './DocsSidebar';
import DocsMainContent from './DocsMainContent';
import SandboxPanel from './SandboxPanel';
import JsonUploadModal from './JsonUploadModal';
import AiUploadModal from './AiUploadModal';

export default function PartnerDocs() {
  const {
    activeEndpoints,
    activeEpId,
    authToken,
    setAuthToken,
    requestBodies,
    apiResponses,
    setApiResponses,
    loadingStates,
    selectedLang,
    setSelectedLang,
    isFormMode,
    setIsFormMode,
    middleScrollRef,
    sidebarScrollRef,
    apiRefs,
    handleTextareaChange,
    handleFormFieldChange,
    handleExecuteSandbox,
    scrollToApi,
    categories,
    refreshUploadedEndpoints,
  } = usePartnerDocs();

  const [showUpload, setShowUpload] = useState(false);
  const [showAiUpload, setShowAiUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsAdmin(user.role === 'admin');
      } catch {}
    }
  }, []);

  const handleImport = () => {
    refreshUploadedEndpoints();
  };

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 text-sm overflow-hidden select-text font-sans">
      <DocsSidebar
        sidebarScrollRef={sidebarScrollRef}
        categories={categories}
        activeEndpoints={activeEndpoints}
        activeEpId={activeEpId}
        scrollToApi={scrollToApi}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {isAdmin && (
          <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
            <button
              onClick={() => setShowAiUpload(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer border-0"
            >
              + AI Upload
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition cursor-pointer border-0"
            >
              + Import JSON
            </button>
          </div>
        )}
        <DocsMainContent
          middleScrollRef={middleScrollRef}
          activeEndpoints={activeEndpoints}
          apiRefs={apiRefs}
        />
      </div>
      <SandboxPanel
        currentActiveEp={activeEndpoints.find(e => e.id === activeEpId) || activeEndpoints[0]}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        requestBodies={requestBodies}
        authToken={authToken}
        setAuthToken={setAuthToken}
        isFormMode={isFormMode}
        setIsFormMode={setIsFormMode}
        handleFormFieldChange={handleFormFieldChange}
        handleTextareaChange={handleTextareaChange}
        handleExecuteSandbox={handleExecuteSandbox}
        loadingStates={loadingStates}
        apiResponses={apiResponses}
        setApiResponses={setApiResponses}
      />
      <JsonUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onImport={handleImport}
      />
      <AiUploadModal
        isOpen={showAiUpload}
        onClose={() => setShowAiUpload(false)}
        onImport={handleImport}
      />
    </div>
  );
}
