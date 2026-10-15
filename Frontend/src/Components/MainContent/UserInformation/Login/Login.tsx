import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Flag } from "lucide-react";
import { UserLogin } from "src/Utils/ApiCalls";
import GenratePasswordModal from "./GenratePasswordModal";
import ChangePasswordModal from "./ChangePasswordModa";

interface FormValues {
  email: string;
  password: string;
}

const Login = ({
  setLogin,
  next,
}: {
  setLogin: (val: boolean) => void;
  next: () => void;
}) => {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [genrateModal, setGenrateModal] = useState<boolean>(false);
  const [chagneModal, setChangeModal] = useState<boolean>(false);
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      const res = await UserLogin(values);
      if (res.status != 200) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1500);
        return setMessage(res.message);
      }
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("token", res.data.token);
      next();
    },
  });

  return (
    <div className="mx-auto p-6">
      {error && <p style={{ color: "red" }}>{message}</p>}
      <form
        onSubmit={formik.handleSubmit}
        className="space-y-4 grid grid-cols-2 gap-x-3"
      >
        <div style={{ marginTop: "1rem" }}>
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
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            <span style={{ color: "red" }}>* </span>
            Password
          </label>
          <input
            id="password"
            placeholder="1Aa!1Aa!"
            type="password"
            {...formik.getFieldProps("password")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-600 text-sm">{formik.errors.password}</div>
          )}
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>
      </form>
      <div
        style={{
          marginTop: ".5rem ",
          display: "flex",
          justifyContent: "end",
          gap: "1rem",
        }}
      >
        <button
          className="align-end hover:text-green text-sky-500 fw-700 underline"
          style={{ fontSize: "12px" }}
          onClick={() => setChangeModal(true)}
        >
          Change Password
        </button>{" "}
        <button
          className="align-end hover:text-green text-sky-500 fw-700 underline"
          style={{ fontSize: "12px" }}
          onClick={() => setGenrateModal(true)}
        >
          Forgot Password
        </button>
        <button
          className="align-end hover:text-green text-sky-500 fw-700 underline"
          style={{ fontSize: "12px" }}
          onClick={() => setLogin(false)}
        >
          Register
        </button>
      </div>
      {genrateModal && (
        <GenratePasswordModal onClose={() => setGenrateModal(false)} />
      )}{" "}
      {chagneModal && (
        <ChangePasswordModal onClose={() => setChangeModal(false)} />
      )}
    </div>
  );
};

export default Login;
