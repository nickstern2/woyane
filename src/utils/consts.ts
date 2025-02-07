import { FormikConfig } from "formik";
import { LoginFormInitialValuesType } from "./types";

export const title = "Woyane";
export const description =
  "Woyane is a powerful 30-minute documentary that exposes the hidden genocide in Tigray, Ethiopia, one of the deadliest conflicts of the 21st century. Following a group of determined journalists, the film highlights their efforts to report the atrocities despite the risks of imprisonment or execution. Through firsthand accounts and warzone footage, Woyane reveals the brutal reality of the Tigray genocide, shedding light on the experiences of millions of civilians who have been targeted and caught in the crossfire.";
// "Woyane is an intimate and harrowing glimpse into this decade's greatest humanitarian crisis and one of the deadliest conflicts of the 21st century, the hidden genocide of Tigray, Ethiopia. This 30-minute expository film follows a coalition of journalists who will stop at nothing to report the atrocities that have been inflicted upon their land and people, even if it means facing imprisonment or execution. With a powerful combination of first-hand testimonials and on-the-ground warzone footage, Woyane uncovers the brutal reality of the Tigray genocide and brings to light the lived experiences of millions of civilians who have been caught in the crossfires and, in many cases, systematically targeted.";

export const LoginFormInitialValues: LoginFormInitialValuesType = {
  email: "",
  password: "",
};
