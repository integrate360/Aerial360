import React from "react";
import SectionHeader from "../MainUtils/SectionHeader";
import RazorpayIntegration from "./RazorpayButton/RazorpayButton";
import Summary from "./Summary/PaymentSummary";
import PackageSummary from "./Summary/PaymentPackageSummary";
import { useAppSelector } from "src/Redux/hooks";
import PackageRazorpayIntegration from "./RazorpayButton/PackageRazorPayButton";

const Payments = ({ prev }: { prev: (e: number) => void }) => {
  const isPackage = useAppSelector((state) => state?.app?.isPackage);
  return (
    <div>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          // overflowY: "scroll",
        }}
      >
        <SectionHeader title="Payments" isPrev={true} prev={prev} />
        {isPackage ? (
          <>
            <PackageSummary />
            <PackageRazorpayIntegration prev={prev} />
          </>
        ) : (
          <>
            <Summary />
            <RazorpayIntegration prev={prev} />
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
