// src/ProtectedRoute.js
import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { TitleContext } from "../TitleContext";

const ProtectedRouteWrapper = ({
  Component,
  title,
  setBreadcrumbs,
  currentUser,
  ...props
}) => {
  // Safely retrieve breadcrumbs from the TitleContext.
  const breadcrumbs = useContext(TitleContext)?.breadcrumbs || [];

  React.useEffect(() => {
    // Only update breadcrumbs if a title is provided.
    if (setBreadcrumbs && title !== undefined) {
      // Compute new breadcrumbs based on whether title is a function or a static value.
      const newBreadcrumbs =
        typeof title === "function" ? title(props.match.params) : title;

      // Update breadcrumbs only if they have changed.
      if (JSON.stringify(newBreadcrumbs) !== JSON.stringify(breadcrumbs)) {
        setBreadcrumbs(newBreadcrumbs);
      }
    }
  }, [title, props.match.params, setBreadcrumbs, breadcrumbs]);

  return currentUser ? (
    // Pass title down to the component if provided.
    <Component {...props} title={title ?? undefined} />
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
