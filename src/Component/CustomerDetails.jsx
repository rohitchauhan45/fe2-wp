import { useEffect, useMemo, useState } from "react"
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

const extractFolderValue = (metadata) => {
  if (!metadata) return null

  if (typeof metadata === "object") {
    if (metadata.folder) return metadata.folder
    if (Array.isArray(metadata)) {
      for (const item of metadata) {
        const folder = extractFolderValue(item)
        if (folder) return folder
      }
    }
    return null
  }

  return null
}

const formatFolderLabel = (folder) => {
  if (!folder) return null
  if (typeof folder === "string") return folder
  if (typeof folder === "object") {
    if (folder.name) return folder.name
    if (folder.title) return folder.title
    if (folder.folderName) return folder.folderName
    if (folder.id) return `Folder ${folder.id}`
    return JSON.stringify(folder)
  }

  return String(folder)
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

function CustomerDetails() {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("ALL")
  const [activeDocumentId, setActiveDocumentId] = useState(null)

  useEffect(() => {
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
  }, [])

  const customer = details?.customer
  const userRecord = details?.userRecord
  const documents = details?.documents || []
  const folderNames = useMemo(() => {
    const unique = new Set()
    const labels = []
    documents.forEach((doc) => {
      const folder = extractFolderValue(doc.metadata)
      const label = formatFolderLabel(folder)
      if (label && !unique.has(label)) {
        unique.add(label)
        labels.push(label)
      }
    })
    return labels
  }, [documents])

  useEffect(() => {
    if (selectedFolder !== "ALL" && !folderNames.includes(selectedFolder)) {
      setSelectedFolder("ALL")
    }
  }, [folderNames, selectedFolder])

  const displayedDocuments = useMemo(() => {
    if (selectedFolder === "ALL") return documents
    return documents.filter((doc) => {
      const folder = formatFolderLabel(extractFolderValue(doc.metadata))
      return folder === selectedFolder
    })
  }, [documents, selectedFolder])

  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pt-28 pb-10">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex h-[calc(100vh-160px)] flex-col">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Document Library ({displayedDocuments.length})
            </h2>
            <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-600">
              Synced
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedFolder("ALL")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
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
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${
                    selectedFolder === folder
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {folder}
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-500">
                No folders detected yet. Upload a file to create one automatically.
              </span>
            )}
          </div>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-2">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-rose-700">
                <p className="font-medium">We hit a snag</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && displayedDocuments.length === 0 && (
              selectedFolder === "ALL" ? (
                <EmptyState />
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
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
                    className={`rounded-2xl border p-4 shadow-inner shadow-gray-50 transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg ${
                      isActive ? "border-emerald-200 bg-emerald-50/60" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{previewText}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        {formatDate(document.createdAt)}
                      </span>
                    </div>
                    {driveLink && isActive && (
                      <div className="mt-3">
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-800"
                        >
                          Open in Google Drive
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
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