import React from 'react';
import PermissionModal from '../PermissionModal';
import usePartnerDocs from './usePartnerDocs';
import DocsSidebar from './DocsSidebar';
import DocsMainContent from './DocsMainContent';
import SandboxPanel from './SandboxPanel';

export default function PartnerDocs() {
  const {
    rawProjectData,
    showPermissionModal,
    setShowPermissionModal,
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
    handleTogglePermission,
    activeEndpoints,
    currentActiveEp,
    handleFormFieldChange,
    handleTextareaChange,
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
        currentActiveEp={currentActiveEp}
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

      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        rawProjectData={rawProjectData}
        onTogglePermission={handleTogglePermission}
      />

    </div>
  );
}
