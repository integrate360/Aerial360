import React, { useState } from "react";
import * as Yup from "yup";
import { Minus, Plus, X } from "lucide-react";
import { useFormik } from "formik";
import { changePassword, forgotPassword } from "src/Utils/ApiCalls";
import { generatePassword } from "src/Utils/Functions";
interface FormValues {
  email: string;
  password: string;
  newPassword: string;
}

const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
      newPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
      newPassword: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must be 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      const res = await changePassword(
        values?.email,
        values?.password,
        values?.newPassword
      );
      if (res.status != 200) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1500);
        return setMessage(res.message);
      }
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("token", res.data.token);
      onClose();
    },
  });
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <div className="flex justify-between items-center mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: error ? "orangered" : "black" }}
          >
            {error ? message : "Chagne Password"}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4 grid gap-x-3">
          <div style={{ marginTop: ".5rem" }}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              <span style={{ color: "red" }}>* </span>
              Email:
            </label>
            <input
              id="email"
              placeholder="example@email.com"
              type="email"
              {...formik.getFieldProps("email")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-sm">{formik.errors.email}</div>
            )}
          </div>{" "}
          <div style={{ marginTop: ".5rem" }}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              <span style={{ color: "red" }}>* </span>
              Password
            </label>
            <input
              id="password"
              placeholder="password"
              type="password"
              {...formik.getFieldProps("password")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm">
                {formik.errors.password}
              </div>
            )}
          </div>
          <div style={{ marginTop: ".5rem" }}>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              <span style={{ color: "red" }}>* </span>
              New Password:
            </label>
            <input
              id="newPassword"
              placeholder="New Password"
              type="password"
              {...formik.getFieldProps("newPassword")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="text-red-600 text-sm">
                {formik.errors.newPassword}
              </div>
            )}
          </div>
          <div style={{ marginTop: ".5rem" }}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              <span style={{ color: "red" }}>* </span>
              Confirm Password
            </label>
            <input
              id="conformPassword"
              placeholder="confirm"
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
            />
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <button
              // onClick={() => onConfirm(additionalPeople)}
              className={`px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 `}
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
