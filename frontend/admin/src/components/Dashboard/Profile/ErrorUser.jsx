import React from "react";

export default function ErrorUser(props) {
  return (
    <div className="text-red-500 border border-white p-4 text-center">
      {props.children}
    </div>
  );
}
