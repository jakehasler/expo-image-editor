import React from "react";
import { Modal as RNModal, Platform } from "react-native";
//@ts-ignore

interface IUniversalModalProps extends React.ComponentProps<typeof RNModal> {
  children: React.ReactNode;
}

export const UniversalModal = (props: IUniversalModalProps) => {
  return <RNModal {...props} />;
};
