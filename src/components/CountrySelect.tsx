import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import worldCountries from "world-countries";
import { FormikProps } from "formik";
import { CheckoutFormValues } from "../utils/payment-handlers";

// Format the country data for the dropdown
const countries = worldCountries.map((country) => ({
  code: country.cca2,
  label: country.name.common,
  flag: `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`,
  currency: country.currencies ? Object.keys(country.currencies)[0] : "N/A",
}));

const CountryDropdown = ({
  formik,
}: {
  formik: FormikProps<CheckoutFormValues>;
}) => {
  // console.log("!!countries", countries);
  return (
    <Autocomplete
      fullWidth
      options={countries}
      getOptionLabel={(option) => `${option.label} (${option.currency})`}
      value={countries.find((c) => c.code === formik.values.country) || null}
      onChange={(_, newValue) => {
        console.log("!!newValue", newValue);
        formik.setFieldValue("country", newValue?.code || "US");
        formik.setFieldValue("currency", newValue?.currency || "USD");
      }}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.code}
          style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={option.flag} alt='' width={20} />
          {option.label} ({option.currency})
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          name='country'
          fullWidth
          label='Country'
          size='small'
          error={formik.touched.country && Boolean(formik.errors.country)}
          helperText={formik.touched.country && formik.errors.country}
          slotProps={{
            select: { required: true },
          }}
        />
      )}
    />
  );
};
export default CountryDropdown;
