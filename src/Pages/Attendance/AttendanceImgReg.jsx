import { useEffect, useState } from "react";
import { Upload, CheckCircle, X, ChevronDown } from "lucide-react";
import { toast } from 'react-toastify';
import { attendanceEnroll } from "../../Api/Attendance/AttendanceApi";
import { getAllUserRoles, filterUserByRole } from "../../Api/StaffManagement/UserManagementAPI";
import {
  MAX_FILE_SIZE, MIN_IMAGES, MAX_IMAGES, VALID_IMAGE_TYPES,
  TOAST_LOAD_ROLES_FAILED, TOAST_LOAD_USERS_FAILED, TOAST_IMAGE_UPLOADED,
  TOAST_MAX_IMAGES, TOAST_INVALID_TYPE, TOAST_FILE_TOO_LARGE,
  TOAST_IMAGE_REMOVED, TOAST_COMPLETE_FIELDS,
  TOAST_ENROLLMENT_SUCCESS, TOAST_ENROLLMENT_FAILED, TOAST_UPLOAD_CANCELLED,
  UI_STRINGS
} from "../../Constants/StringConstants/AttendanceConstants";

const AttendanceImgReg = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await getAllUserRoles();
        setRoles(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        toast.error(TOAST_LOAD_ROLES_FAILED);
      }
    };
    loadRoles();
  }, []);

  const handleRoleChange = async (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setSelectedName("");
    setSelectedUserId("");
    setUsers([]);

    if (!role) return;

    try {
      setLoadingUsers(true);
      const res = await filterUserByRole(role);
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toast.error(TOAST_LOAD_USERS_FAILED);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleNameChange = (e) => {
    const userId = e.target.value;
    setSelectedName(userId);
    setSelectedUserId(userId);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    toast.success(TOAST_IMAGE_UPLOADED);
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFiles = (files) => {
    if (images.length + files.length > MAX_IMAGES) {
      setError(TOAST_MAX_IMAGES(MAX_IMAGES));
      toast.error(TOAST_MAX_IMAGES(MAX_IMAGES));
      return;
    }

    const newImages = [];
    let hasError = false;

    for (let file of files) {
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setError(TOAST_INVALID_TYPE);
        toast.error(TOAST_INVALID_TYPE);
        hasError = true;
        break;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(TOAST_FILE_TOO_LARGE(file.name));
        toast.error(TOAST_FILE_TOO_LARGE(file.name));
        hasError = true;
        break;
      }

      newImages.push({
        id: Date.now() + Math.random(),
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }

    if (!hasError) {
      setError("");
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (updated.length <= MAX_IMAGES) {
        setError("");
      }
      return updated;
    });
    toast.info(TOAST_IMAGE_REMOVED);
  };

  const handleSave = async () => {
    if (!selectedRole || !selectedUserId || images.length < 5) {
      toast.error(TOAST_COMPLETE_FIELDS);
      return;
    }

    try {
      const imageFiles = images.map(img => img.file);

      const response = await attendanceEnroll({
        userId: selectedUserId,
        userType: selectedRole,
        images: imageFiles
      });
      console.log("Atendance Enroll Response-:", response);

      toast.success(TOAST_ENROLLMENT_SUCCESS);

      setImages([]);
      setSelectedRole("");
      setSelectedName("");
      setSelectedUserId("");
    } catch (err) {
      toast.error(err.message || TOAST_ENROLLMENT_FAILED);
    }
  };

  const handleCancel = () => {
    setImages([]);
    setError("");
    setSelectedRole("");
    setSelectedName("");
    setSelectedUserId("");
    toast.info(TOAST_UPLOAD_CANCELLED);
  };

  const remainingSlots = MAX_IMAGES - images.length;
  // Replace the '{count}' placeholder dynamically
  const descStr = UI_STRINGS.IMG_REG.DESCRIPTION.replace('{count}', MIN_IMAGES);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {UI_STRINGS.IMG_REG.HEADER}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {UI_STRINGS.IMG_REG.ROLE_LABEL} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={selectedRole} onChange={handleRoleChange}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                  >
                    <option value="">{UI_STRINGS.IMG_REG.SELECT_ROLE}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {UI_STRINGS.IMG_REG.NAME_LABEL} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedName}
                    onChange={handleNameChange}
                    disabled={!selectedRole || loadingUsers}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{loadingUsers ? UI_STRINGS.IMG_REG.LOADING : UI_STRINGS.IMG_REG.SELECT_NAME}</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {UI_STRINGS.IMG_REG.USER_ID_LABEL} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedUserId}
                    readOnly
                    placeholder={UI_STRINGS.IMG_REG.AUTO_FILLED}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {descStr}
          </p>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 sm:p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} className="text-blue-600" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                {UI_STRINGS.IMG_REG.DRAG_DROP}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {UI_STRINGS.IMG_REG.SUPPORTS}
              </p>
              <button
                type="button"
                className="bg-blue-600 text-white px-6 cursor-pointer py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => document.getElementById("imageUpload").click()}
              >
                {UI_STRINGS.IMG_REG.SELECT_FILES}
              </button>
            </label>

            <input
              type="file" accept="image/png,image/jpeg,image/jpg" id="imageUpload"
              onChange={handleFileSelect} className="hidden" multiple
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {UI_STRINGS.IMG_REG.UPLOADED_IMAGES} ({images.length}/{MAX_IMAGES})
            </h2>
            {images.length > 0 && images.length < MAX_IMAGES && (
              <span className="text-sm text-blue-600 font-medium">
                {remainingSlots} {remainingSlots === 1 ? UI_STRINGS.IMG_REG.SLOTS_REMAINING_1 : UI_STRINGS.IMG_REG.SLOTS_REMAINING_N}
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((img, index) => (
              <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 group">
                <img src={img.preview} alt={`upload-${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <CheckCircle size={12} />
                  {UI_STRINGS.IMG_REG.VERIFIED}
                </div>
                <button type="button" onClick={() => removeImage(img.id)}
                  className="absolute -top-2 cursor-pointer -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} className="z-10" />
                </button>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded text-xs">
                  {UI_STRINGS.IMG_REG.SLOT} {index + 1}
                </div>
              </div>
            ))}

            {Array.from({ length: remainingSlots }).map((_, index) => (
              <div key={`empty-${index}`} className="relative aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-colors">
                <p className="text-xs text-gray-500 font-medium">{UI_STRINGS.IMG_REG.ADD_IMAGE}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {UI_STRINGS.IMG_REG.SLOT} {images.length + index + 1}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {UI_STRINGS.IMG_REG.IMAGE_REQ}
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><span className="text-blue-600">✓</span>{UI_STRINGS.IMG_REG.REQ_1}</div>
                  <div className="flex items-center gap-2"><span className="text-blue-600">✓</span>{UI_STRINGS.IMG_REG.REQ_2}</div>
                  <div className="flex items-center gap-2"><span className="text-blue-600">✓</span>{UI_STRINGS.IMG_REG.REQ_3}</div>
                  <div className="flex items-center gap-2"><span className="text-blue-600">✓</span>{UI_STRINGS.IMG_REG.REQ_4}</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button type="button" onClick={handleCancel}
              className="w-full cursor-pointer sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              {UI_STRINGS.COMMON.CANCEL}
            </button>
            <button type="button" onClick={handleSave}
              disabled={!selectedRole || !selectedName || !selectedUserId || images.length < MIN_IMAGES}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors ${!selectedRole || !selectedName || !selectedUserId || images.length < MIN_IMAGES
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                }`}>
              {UI_STRINGS.IMG_REG.BTN_SAVE}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceImgReg;