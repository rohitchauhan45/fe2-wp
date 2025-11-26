import { useEffect, useMemo, useState } from "react"
import { Folder } from "lucide-react"
import { getCustomerDetails } from "../Services/Customer"
import CustomerDetails from "./CustomerDetails"

const getFolderLabel = (document) => {
  if (!document) return null
  if (document.folderName) return document.folderName
  if (document.folderId) return `Folder ${document.folderId}`
  return "Uncategorized"
}

function CustomerFolder() {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedFolder, setSelectedFolder] = useState(null)

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
        setError(response?.message || "Unable to load folders right now.")
      }
      setLoading(false)
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [])

  const documents = details?.documents || []
  const folderNames = useMemo(() => {
    const unique = new Set()
    documents.forEach((doc) => {
      const label = getFolderLabel(doc) || "Uncategorized"
      unique.add(label)
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [documents])

  if (selectedFolder) {
    return (
      <CustomerDetails
        initialFolder={selectedFolder}
        folderLocked
        onBack={() => setSelectedFolder(null)}
        detailsOverride={details}
      />
    )
  }

  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-20 sm:pt-28 pb-6 sm:pb-10">
        <section className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col">
          <header className="flex flex-col gap-2">
            <p className="text-lg sm:text-xl font-semibold tracking-wider ">
              My Folders
            </p>
            
          </header>

          {loading && (
            <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="h-24 sm:h-28 animate-pulse rounded-xl sm:rounded-2xl bg-gray-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-rose-100 bg-rose-50/80 p-3 sm:p-4 text-rose-700">
              <p className="text-sm sm:text-base font-medium">We hit a snag</p>
              <p className="text-xs sm:text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && folderNames.length === 0 && (
            <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
              No folders detected yet. Upload files to create folders automatically.
            </div>
          )}

          {!loading && !error && folderNames.length > 0 && (
            <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {folderNames.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setSelectedFolder(folder)}
                  className="rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Folder className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
                    <h1 className="text-base sm:text-[17px] font-semibold text-gray-800 ">{folder}</h1>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default CustomerFolder
