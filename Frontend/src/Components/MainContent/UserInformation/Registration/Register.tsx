import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Flag } from "lucide-react";
import { UserRegistration } from "src/Utils/ApiCalls";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  medicalCondition: string;
  emergencyPhone: string;
  termsAccepted: boolean;
}

const RegistrationForm = ({
  setLogin,
  next,
}: {
  setLogin: (val: boolean) => void;
  next: () => void;
}) => {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      medicalCondition: "",
      emergencyPhone: "",
      termsAccepted: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("First name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must be 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("Password is required"),
      emergencyPhone: Yup.string()
        .matches(
          /^\d{10}$/,
          "Emergency contact number must be exactly 10 digits"
        )
        .required("Emergency contact number is required"),
      termsAccepted: Yup.boolean()
        .oneOf([true], "You must accept the terms")
        .required("You must accept the terms"),
    }),
    onSubmit: async (values) => {
      const res = await UserRegistration(values);
      if (res.status != 200) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1500);
        return setMessage(res?.message);
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
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            <span style={{ color: "red" }}>* </span>
            Name:
          </label>
          <input
            id="name"
            type="text"
            placeholder="your full name"
            {...formik.getFieldProps("name")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-600 text-sm">{formik.errors.name}</div>
          )}
        </div>

        <div>
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
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            <span style={{ color: "red" }}>* </span>
            Phone
          </label>
          <input
            id="phone"
            type="number"
            {...formik.getFieldProps("phone")}
            placeholder="Enter phone"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-red-600 text-sm">{formik.errors.phone}</div>
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
            placeholder="Password"
            type="password"
            {...formik.getFieldProps("password")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-600 text-sm">{formik.errors.password}</div>
          )}
        </div>
        <div>
          <label
            htmlFor="medicalCondition"
            className="block text-sm font-medium text-gray-700"
          >
            Medical Condition
          </label>
          <input
            id="medicalCondition"
            type="text"
            placeholder="any diffculties"
            {...formik.getFieldProps("medicalCondition")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.medicalCondition &&
            formik.errors.medicalCondition && (
              <div className="text-red-600 text-sm">
                {formik.errors.medicalCondition}
              </div>
            )}
        </div>

        <div>
          <label
            htmlFor="emergencyPhone"
            className="block text-sm font-medium text-gray-700"
          >
            <span style={{ color: "red" }}>* </span>
            Emergency Contact Number
          </label>
          <input
            id="emergencyPhone"
            type="number"
            {...formik.getFieldProps("emergencyPhone")}
            placeholder="Emergency Phone"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 pl-2 border-2 border-gray-300"
          />
          {formik.touched.emergencyPhone && formik.errors.emergencyPhone && (
            <div className="text-red-600 text-sm">
              {formik.errors.emergencyPhone}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="termsAccepted"
                type="checkbox"
                {...formik.getFieldProps("termsAccepted")}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                I have read the terms of the refunds / cancellation policies
              </label>
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                <div className="text-red-600 text-sm">
                  {formik.errors.termsAccepted}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </div>
        <div></div>
        <div
          style={{
            marginTop: ".5rem ",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <button
            className="align-end hover:text-green text-sky-500 fw-700 underline"
            onClick={() => setLogin(true)}
          >
            Already Have a Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
