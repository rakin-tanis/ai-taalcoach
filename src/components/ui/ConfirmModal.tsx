import React from 'react'

const ConfirmModal = (
  {
    confirmText,
    showConfirmModal,
    handleDeleteConfirm,
    handleDeleteCancel
  }
    : {
      confirmText: string,
      showConfirmModal: boolean,
      handleDeleteConfirm: () => void,
      handleDeleteCancel: () => void
    }) => {

  if (showConfirmModal)
    return (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <p className="text-center text-lg mb-4 dark:text-gray-900">
            {confirmText}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Yes
            </button>
            <button
              onClick={handleDeleteCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

    )
}

export default ConfirmModal
