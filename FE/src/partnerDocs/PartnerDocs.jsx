import React from 'react';
import usePartnerDocs from './usePartnerDocs';
import DocsSidebar from './DocsSidebar';
import DocsMainContent from './DocsMainContent';
import SandboxPanel from './SandboxPanel';

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
  } = usePartnerDocs();

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 text-sm overflow-hidden select-text font-sans">
      <DocsSidebar
        sidebarScrollRef={sidebarScrollRef}
        categories={categories}
        activeEndpoints={activeEndpoints}
        activeEpId={activeEpId}
        scrollToApi={scrollToApi}
      />
      <DocsMainContent
        middleScrollRef={middleScrollRef}
        activeEndpoints={activeEndpoints}
        apiRefs={apiRefs}
      />
      <SandboxPanel
        currentActiveEp={activeEndpoints.find(e => e.id === activeEpId) || activeEndpoints[0]}
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
    </div>
  );
}