import { useEffect, useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getCustomerDetails } from "../Services/Customer"

const formatDate = (value) => {
  if (!value) return "Unknown"
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return value
  }
}

const normalizeMetadata = (metadata) => {
  if (!metadata) return null
  if (typeof metadata === "string") {
    const trimmed = metadata.trim()
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed)
      } catch {
        return { rawText: metadata }
      }
    }
    return { rawText: metadata }
  }
  return metadata
}

const extractRawText = (metadata) => {
  const normalized = normalizeMetadata(metadata)
  if (!normalized) return null

  if (typeof normalized === "object") {
    if (normalized.rawText) return normalized.rawText
    if (Array.isArray(normalized)) {
      for (const item of normalized) {
        const value = extractRawText(item)
        if (value) return value
      }
    }
    return null
  }

  return typeof normalized === "string" ? normalized : String(normalized)
}

const extractDriveLink = (metadata) => {
  const normalized = normalizeMetadata(metadata)
  if (!normalized) return null

  if (typeof normalized === "object") {
    const link = normalized.driveLink || normalized.webViewLink || normalized.webViewUrl
    if (link) return link

    if (Array.isArray(normalized)) {
      for (const item of normalized) {
        const nestedLink = extractDriveLink(item)
        if (nestedLink) return nestedLink
      }
    }
    return null
  }

  if (typeof normalized === "string" && normalized.startsWith("http")) return normalized

  return null
}

const getFolderLabel = (document) => {
  if (!document) return null
  if (document.folderName) return document.folderName
  if (document.folderId) return `Folder ${document.folderId}`
  return null
}

const getDocumentLink = (document) => {
  if (document.googleDriveLink) return document.googleDriveLink
  return extractDriveLink(document.metadata)
}


const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-10 text-center">
    <p className="text-sm uppercase tracking-wide text-gray-400 mb-3">No Documents</p>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">You haven&apos;t uploaded anything yet</h3>
    <p className="text-gray-500 max-w-md">
      Upload files to see them listed here along with quick metadata and created dates.
    </p>
  </div>
)

function CustomerDetails({
  initialFolder = "ALL",
  folderLocked = false,
  onBack,
  detailsOverride = null,
}) {
  const [details, setDetails] = useState(detailsOverride || null)
  const [loading, setLoading] = useState(!detailsOverride)
  const [error, setError] = useState("")
  const [selectedFolder, setSelectedFolder] = useState(
    folderLocked ? initialFolder : initialFolder || "ALL",
  )
  const [activeDocumentId, setActiveDocumentId] = useState(null)

  useEffect(() => {
    setSelectedFolder(folderLocked ? initialFolder : initialFolder || "ALL")
  }, [initialFolder, folderLocked])

  useEffect(() => {
    if (detailsOverride) {
      setDetails(detailsOverride)
      setLoading(false)
      setError("")
      return
    }

    let isMounted = true
    const loadDetails = async () => {
      setLoading(true)
      const response = await getCustomerDetails()
      if (!isMounted) return

      if (response?.success) {
        setDetails(response.customerDetails || null)
        setError("")
      } else {
        setError(response?.message || "Unable to load customer details right now.")
      }
      setLoading(false)
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [detailsOverride])

  const customer = details?.customer
  const userRecord = details?.userRecord
  const documents = details?.documents || []
  const folderNames = useMemo(() => {
    const unique = new Set()
    const labels = []
    documents.forEach((doc) => {
      const label = getFolderLabel(doc)
      if (label && !unique.has(label)) {
        unique.add(label)
        labels.push(label)
      }
    })
    return labels
  }, [documents])

  useEffect(() => {
    if (folderLocked) return
    if (selectedFolder !== "ALL" && !folderNames.includes(selectedFolder)) {
      setSelectedFolder("ALL")
    }
  }, [folderNames, folderLocked, selectedFolder])

  const displayedDocuments = useMemo(() => {
    if (selectedFolder === "ALL") return documents
    return documents.filter((doc) => getFolderLabel(doc) === selectedFolder)
  }, [documents, selectedFolder])

  const shouldForceTallLayout = displayedDocuments.length > 4

  const currentFolderLabel =
    selectedFolder === "ALL" ? "All Documents" : selectedFolder || "Untitled Folder"
  const documentCountLabel = `${displayedDocuments.length}`

  const handleFolderRootClick = () => {
    if (onBack) {
      onBack()
      return
    }
    setSelectedFolder("ALL")
  }

  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-20 sm:pt-28 pb-6 sm:pb-10">
        <section
          className={`rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col ${
            shouldForceTallLayout ? "h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]" : "min-h-[300px] sm:min-h-[400px]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-500 flex-wrap">
              <button
                type="button"
                onClick={handleFolderRootClick}
                className="text-base sm:text-xl font-semibold tracking-wider"
              >
                My Folder
              </button>
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700 flex-shrink-0" aria-hidden="true" />
              <span className="text-gray-900 text-base sm:text-xl font-semibold tracking-wider break-words">
                {currentFolderLabel} ({documentCountLabel})
              </span>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold text-emerald-600 whitespace-nowrap">
              Synced
            </span>
          </div>

          {!folderLocked && (
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSelectedFolder("ALL")}
                className={`rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold ${
                  selectedFolder === "ALL"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                All Folders
              </button>
              {folderNames.length > 0 ? (
                folderNames.map((folder) => (
                  <button
                    key={`folder-chip-${folder}`}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    className={`rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold ${
                      selectedFolder === folder
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {folder}
                  </button>
                ))
              ) : (
                <span className="text-[10px] sm:text-xs text-gray-500">
                  No folders detected yet. Upload a file to create one automatically.
                </span>
              )}
            </div>
          )}

          <div className="mt-4 sm:mt-5 flex-1 space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl sm:rounded-2xl border border-rose-100 bg-rose-50/80 p-3 sm:p-4 text-rose-700">
                <p className="text-sm sm:text-base font-medium">We hit a snag</p>
                <p className="text-xs sm:text-sm mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && displayedDocuments.length === 0 && (
              selectedFolder === "ALL" ? (
                <EmptyState />
              ) : (
                <div className="rounded-xl sm:rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
                  No documents found in <span className="font-semibold">{selectedFolder}</span>.
                </div>
              )
            )}

            {!loading &&
              !error &&
              displayedDocuments.length > 0 &&
              displayedDocuments.map((document) => {
                const driveLink = getDocumentLink(document)
                const previewText =
                  extractRawText(document.metadata) || document.fileName || "Untitled document"
                const isActive = activeDocumentId === document.id

                const toggleActive = () =>
                  setActiveDocumentId((prev) => (prev === document.id ? null : document.id))

                return (
                  <article
                    key={document.id}
                    role="button"
                    tabIndex={0}
                    onClick={toggleActive}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        toggleActive()
                      }
                    }}
                    className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-inner shadow-gray-50 transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg ${
                      isActive ? "border-emerald-200 bg-emerald-50/60" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-[15px] font-semibold text-gray-900 break-words">{previewText}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatDate(document.createdAt)}
                      </span>
                    </div>
                    {driveLink && isActive && (
                      <div className="mt-2 sm:mt-3">
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-emerald-600 transition hover:text-emerald-800"
                        >
                          Open in Google Drive
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          >
                            <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zm4 14v2H5V6h2v11h11z" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </article>
                )
              })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default CustomerDetails