import React from "react";
import { setSelectedPackage } from "src/Redux/appSlice";
import { useAppDispatch } from "src/Redux/hooks";
import { PackageClass } from "src/Utils/Types";

const Packages = ({
  packages,
  jumpTo,
}: {
  packages: PackageClass[];
  jumpTo: (num: number) => void;
}) => {
  const dispatch = useAppDispatch();
  return (
    <div style={styles.container}>
      {packages?.length > 0 && (
        <p className="package-section-sub-header">
          Hey, there are special packages with this service, check them out!
        </p>
      )}
      {packages?.map((p) => (
        <div
          key={p?._id}
          style={styles.packageCard}
          onClick={() => {
            jumpTo(11);
            dispatch(setSelectedPackage(p));
          }}
        >
          <div style={styles.packageHeader}>
            <h3 style={styles.packageName}>{p?.name}</h3>
            <div style={styles.priceContainer}>
              <span style={styles.price}>INR{p?.price.toLocaleString()}</span>
            </div>
          </div>
          <div style={styles.services}>
            {Array.isArray(p?.services) &&
              p?.services.map((service, index) => (
                <span key={index} style={styles.service}>
                  {typeof service === "string" ? service : service.name}
                  {index < p?.services.length - 1 && " • "}
                </span>
              ))}
          </div>
        </div>
      ))}
      {packages?.length > 0 && (
        <p
          className=""
          style={{ color: "gray", marginTop: "2rem", textAlign: "center" }}
        >
          ---------------------------or---------------------------
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "16px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  packageCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "16px",
    // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e6e6e6",
    marginBottom: "16px",
    cursor: "pointer",
  },
  packageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: "8px",
  },
  packageName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
  },
  priceContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  price: {
    color: "#6b46c1",
    fontWeight: "500",
    fontSize: "16px",
  },
  services: {
    color: "#666",
    fontSize: "14px",
  },
  service: {
    display: "inline",
  },
};

export default Packages;
