import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Settings,
  Save,
  Edit3,
  ArrowLeft,
  Building,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function InstitutionSettings() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    phone: "",
    address: "",
    description: "",
  });
  const [edit, setEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const editableFields = ["phone", "address", "description"];

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setFields({
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setErrMsg("Failed to load institution data.");
        setLoading(false);
      });
  }, [idOrName]);

  const handleEdit = (key) => setEdit((e) => ({ ...e, [key]: true }));
  const handleChange = (key, value) =>
    setFields((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/update`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        setEdit({});
        toast.success("Institution settings updated successfully!");
      })
      .catch(() => {
        setErrMsg("Failed to update institution settings.");
        toast.error("Failed to update settings");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCancel = () => {
    setEdit({});
    // Reset fields to original values by refetching
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setFields({
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
        });
      })
      .catch(() => {
        setErrMsg("Failed to reload institution data.");
      });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading settings...
        </div>
      </div>
    );

  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{errMsg}</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}`}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="h-8 w-8 text-gray-500" />
            Institution Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your institution's profile and information
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Phone */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {edit.phone ? (
                  <input
                    type="text"
                    value={fields.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900">{fields.phone || "Not set"}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("phone")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Address */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <MapPin className="h-5 w-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {edit.address ? (
                  <textarea
                    value={fields.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter institution address"
                  />
                ) : (
                  <p className="text-gray-900">{fields.address || "Not set"}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("address")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-5 w-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {edit.description ? (
                  <textarea
                    value={fields.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter institution description"
                  />
                ) : (
                  <p className="text-gray-900">
                    {fields.description || "Not set"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("description")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {Object.keys(edit).length > 0 && (
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
