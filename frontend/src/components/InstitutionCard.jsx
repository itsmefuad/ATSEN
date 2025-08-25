import { useState } from "react";
import { Building, FileText, MapPin } from "lucide-react";
import DocumentRequestForm from "./DocumentRequestForm";

const InstitutionCard = ({ institution, onRequestSuccess }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <Building className="h-10 w-10 text-sky-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{institution.name}</h3>
              {institution.eiin && (
                <p className="text-sm text-gray-600">EIIN: {institution.eiin}</p>
              )}
            </div>
          </div>
        </div>

        {institution.address && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{institution.address}</span>
          </div>
        )}

        {institution.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {institution.description}
          </p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {institution.email && (
              <span>{institution.email}</span>
            )}
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
          >
            <FileText className="h-4 w-4 mr-2" />
            Request Document
          </button>
        </div>
      </div>

      <DocumentRequestForm
        institution={institution}
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={onRequestSuccess}
      />
    </>
  );
};

export default InstitutionCard;
