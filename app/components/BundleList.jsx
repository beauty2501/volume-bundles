import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";

export default function BundleList({ bundles = [] }) {
  const location = useLocation();
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [bundleData, setBundleData] = useState(bundles);
  const [search, setSearch] = useState("");

  const filteredBundles = useMemo(() => {
    return bundleData.filter((bundle) =>
      bundle.bundleName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [bundleData, search]);

  const hasSelection = selectedBundles.length > 0;


  //If bundle already selected → unselect it
  //If bundle not selected → select it
  const toggleBundle = (id) => {

    setSelectedBundles((prev) => {

      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const updateStatus = async (status) => {

    await fetch("/api/update-bundle-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bundleIds: selectedBundles,
        status,
      }),
    });
    setBundleData((prev) =>
      prev.map((bundle) =>
        selectedBundles.includes(bundle.id)
          ? { ...bundle, status }
          : bundle
      )
    );
  
    setSelectedBundles([]);
    // window.location.reload();
  };

  const deleteBundles = async () => {

    await fetch("/api/delete-bundles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bundleIds: selectedBundles,
      }),
    });

    setBundleData((prev) =>
      prev.filter(
        (bundle) => !selectedBundles.includes(bundle.id)
      )
    );
  
    setSelectedBundles([]);
  
    // window.location.reload();
  };

  const getEditPath = (id) => {
    const params = new URLSearchParams(location.search);
    params.set("mode", "edit");
    return `/app/bundle/${id}?${params.toString()}`;
  };

  const getCopyPath = (id) => {
    const params = new URLSearchParams(location.search);
    params.set("mode", "copy");
    return `/app/bundle/${id}?${params.toString()}`;
  };

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
    >

      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
        }}
      >

        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bundle name"
            style={{
              width: "92%",
              padding: "12px 42px 12px 14px",
              border: "1px solid #dcdcdc",
              borderRadius: "8px",
              outline: "none",
            }}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                color: "#777",
              }}
            >
              ✕
            </button>
          )}

        </div>

        <button
          style={{
            padding: "12px 22px",
            border: "1px solid #dcdcdc",
            borderRadius: "8px",
            background: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Search
        </button>

      </div>

      {/* Toolbar */}
      {hasSelection ? (

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "14px 0",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
            marginBottom: "8px",
          }}
        >

          <strong>
            {selectedBundles.length} selected
          </strong>

          <button
            onClick={() => updateStatus("Active")}
            style={{
              border: "none",
              background: "transparent",
              color: "#027a48",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Activate
          </button>

          <button
            onClick={() => updateStatus("Paused")}
            style={{
              border: "none",
              background: "transparent",
              color: "#9a6700",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Pause
          </button>

          <button
            onClick={deleteBundles}
            style={{
              border: "none",
              background: "transparent",
              color: "#d92d20",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Delete
          </button>

        </div>

      ) : (

        <div
          style={{
            padding: "14px 0",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Showing {filteredBundles.length} bundle
          {filteredBundles.length !== 1 ? "s" : ""}
        </div>

      )}

      {/* Rows */}
      <div>

        {filteredBundles.map((bundle) => (

          <div
            key={bundle.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "40px 1.5fr 1fr 1fr 120px",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: "1px solid #eee",
              background: selectedBundles.includes(bundle.id)
                ? "#f5f7fa"
                : "transparent",
            }}
          >

            <input
              type="checkbox"
              checked={selectedBundles.includes(bundle.id)}
              onChange={() => toggleBundle(bundle.id)}
            />

            <div>
              <strong>{bundle.bundleName}</strong>
            </div>

            <div>
              <span
                style={{
                  background:
                    bundle.status === "Paused"
                      ? "#fff1cc"
                      : "#d1fadf",
                  color:
                    bundle.status === "Paused"
                      ? "#9a6700"
                      : "#027a48",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {bundle.status}
              </span>
            </div>

            <div>{bundle.productType}</div>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >

              <Link to={getEditPath(bundle.id)}>
                Edit
              </Link>

              <Link to={getCopyPath(bundle.id)}>
                Copy
              </Link>

            </div>

          </div>

        ))}

      </div>

    </s-box>
  );
}