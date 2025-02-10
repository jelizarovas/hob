// src/ProtectedRoute.js
import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { TitleContext } from "../TitleContext";

const ProtectedRouteWrapper = ({ Component, title, setBreadcrumbs, currentUser, ...props }) => {
  // Use optional chaining to safely get breadcrumbs
  const breadcrumbs = useContext(TitleContext)?.breadcrumbs || [];

  React.useEffect(() => {
    if (setBreadcrumbs) {
      const newBreadcrumbs = typeof title === "function" ? title(props.match.params) : title;
      // Only update if different
      if (JSON.stringify(newBreadcrumbs) !== JSON.stringify(breadcrumbs)) {
        setBreadcrumbs(newBreadcrumbs);
      }
    }
  }, [title, props.match.params, setBreadcrumbs, breadcrumbs]);

  return currentUser ? (
    <Component title={title} {...props} />
  ) : (
    <Redirect to="/login" />
  );
};

const ProtectedRoute = ({ component: Component, title, ...rest }) => {
  const { currentUser } = useAuth();
  // Safely get setBreadcrumbs if TitleContext exists
  const setBreadcrumbs = useContext(TitleContext)?.setBreadcrumbs || null;

  return (
    <Route
      {...rest}
      render={(props) => (
        <ProtectedRouteWrapper
          {...props}
          Component={Component}
          title={title}
          setBreadcrumbs={setBreadcrumbs}
          currentUser={currentUser}
        />
      )}
    />
  );
};

export default ProtectedRoute;
