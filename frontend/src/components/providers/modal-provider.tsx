import { useEffect, useState } from "react";
import { AddResourceTypeModal } from "../modals/add-resource-type-modal";
import { AddResourceModal } from "../modals/add-resource-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AddResourceTypeModal />
      <AddResourceModal />
    </>
  );
};