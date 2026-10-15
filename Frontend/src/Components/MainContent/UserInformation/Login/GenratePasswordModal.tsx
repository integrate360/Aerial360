import React, { useState } from "react";
import * as Yup from "yup";
import { Minus, Plus, X } from "lucide-react";
import { useFormik } from "formik";
import { forgotPassword, genrateOtp } from "src/Utils/ApiCalls";
import { generatePassword } from "src/Utils/Functions";
interface FormValues {
  email: string;
}
interface FormValues2 {
  password: string;
  otp: string;
}
const GenratePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEmail, setIsEmail] = useState<boolean>(true);
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setEmail(values?.email);
      const res = await genrateOtp(values?.email);
      if (res.status != 200) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1500);
        return setMessage(res.message);
      }
      // localStorage.setItem("user", JSON.stringify(res.data));
      // localStorage.setItem("token", res.data.token);
      setIsEmail(false);
    },
  });
  const formikPass = useFormik<FormValues2>({
    initialValues: {
      password: "",
      otp: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must be 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("Password is required"),
      otp: Yup.string().required("OTP is required"),
    }),
    onSubmit: async (values) => {
      const res = await forgotPassword(email, values?.otp, values?.password);
      if (res.status != 200) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1500);
        return setMessage(res.message);
      }
      // localStorage.setItem("user", JSON.stringify(res.data));
      // localStorage.setItem("token", res.data.token);
      onClose();
    },
  });
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        {isEmail ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">
                You will get the otp in you email inbox
              </h2>
              <button
                onClick={() => onClose()}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-4 grid gap-x-3"
            >
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
                  <div className="text-red-600 text-sm">
                    {formik.errors.email}
                  </div>
                )}
              </div>
              {error && <p style={{ color: "red" }}>{message}</p>}
              <div className="flex gap-3 justify-end mt-5">
                <button
                  // onClick={() => onConfirm(additionalPeople)}
                  className={`px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 `}
                >
                  Generate Otp
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {" "}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">
                Enter your otp and new Password
              </h2>
              <button
                onClick={() => onClose()}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={formikPass.handleSubmit}
              className="space-y-4 grid gap-x-3"
            >
              <div style={{ marginTop: ".5rem" }}>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  <span style={{ color: "red" }}>* </span>
                  OTP:
                </label>
                <input
                  id="otp"
                  placeholder="OTP"
                  type="otp"
                  {...formikPass.getFieldProps("otp")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
                />
                {formikPass.touched.otp && formikPass.errors.otp && (
                  <div className="text-red-600 text-sm">
                    {formikPass.errors.otp}
                  </div>
                )}
              </div>{" "}
              <div style={{ marginTop: ".5rem" }}>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  <span style={{ color: "red" }}>* </span>
                  Password:
                </label>
                <input
                  id="password"
                  placeholder="Password"
                  type="password"
                  {...formikPass.getFieldProps("password")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
                />
                {formikPass.touched.password && formikPass.errors.password && (
                  <div className="text-red-600 text-sm">
                    {formikPass.errors.password}
                  </div>
                )}
              </div>
              {error && <p style={{ color: "red" }}>{message}</p>}
              <div className="flex gap-3 justify-end mt-5">
                <button
                  // onClick={() => onConfirm(additionalPeople)}
                  className={`px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 `}
                >
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default GenratePasswordModal;
