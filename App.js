import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { sendData } from "./services/sendData";

export default function App() {
  const today = new Date();
  const [checkInDate, setCheckInDate] = React.useState(today);
  const [checkOutDate, setCheckOutDate] = React.useState(null);
  const [datePickerMode, setDatePickerMode] = React.useState(null);
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { userName: "", email: "", roomType: "standard" },
  });

  const validateDates = (nextCheckInDate, nextCheckOutDate) => {
    if (nextCheckOutDate && nextCheckOutDate <= nextCheckInDate) {
      setError("checkOutDate", {
        type: "validate",
        message: "The Check-Out Date must be later than the Check-In Date",
      });
    } else {
      clearErrors("checkOutDate");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const date = selectedDate || event?.nativeEvent?.timestamp;
    setDatePickerMode(null);
    if (!date) return;

    const nextDate = new Date(date);
    if (datePickerMode === "checkIn") {
      setCheckInDate(nextDate);
      validateDates(nextDate, checkOutDate);
    } else {
      setCheckOutDate(nextDate);
      validateDates(checkInDate, nextDate);
    }
  };

  const onSubmit = (data) => {
    if (!checkOutDate) {
      setError("checkOutDate", {
        type: "required",
        message: "Check-Out Date is required",
      });
      return;
    }
    if (checkOutDate <= checkInDate) {
      setError("checkOutDate", {
        type: "validate",
        message: "The Check-Out Date must be later than the Check-In Date",
      });
      return;
    }
    sendData({
      userName: data.userName,
      email: data.email,
      roomType: data.roomType,
      checkInDate,
      checkOutDate,
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.formHeader}>Booking form</Text>
        <Text style={styles.formTitle}>Name</Text>
        <Controller
          control={control}
          name="userName"
          rules={{
            required: "Name is required",
            pattern: {
              value: /^[A-Z].{2,}$/,
              message:
                "Name must start with a capital letter and contain at least 3 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="user-name-input"
              style={styles.input}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.userName && (
          <Text style={styles.errorText}>{errors.userName.message}</Text>
        )}
        <Text style={styles.formTitle}>email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "e-mail is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email address. Please enter a valid email",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="email-input"
              style={styles.input}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
        <Text style={styles.formTitle}>Check-In Date</Text>
        <TouchableOpacity onPress={() => setDatePickerMode("checkIn")}>
          <Text style={styles.input}>{checkInDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Check-Out Date</Text>
        <TouchableOpacity onPress={() => setDatePickerMode("checkOut")}>
          <Text style={styles.input}>
            {checkOutDate ? checkOutDate.toLocaleDateString() : "Select Date"}
          </Text>
        </TouchableOpacity>
        {errors.checkOutDate && (
          <Text style={styles.errorText}>{errors.checkOutDate.message}</Text>
        )}
        {datePickerMode && (
          <DateTimePicker
            testID="date-time-picker"
            value={datePickerMode === "checkIn" ? checkInDate : checkOutDate || today}
            mode="date"
            onChange={handleDateChange}
          />
        )}
        <Text style={styles.formTitle}>Choose the room type:</Text>
        <Controller
          control={control}
          name="roomType"
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="Standard" value="standard" />
              <Picker.Item label="Luxury" value="luxury" />
              <Picker.Item label="Family" value="family" />
            </Picker>
          )}
        />
        <TouchableOpacity
          style={{ ...styles.button, marginTop: 50 }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    width: "100%",
    maxWidth: 600,
  },
  button: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  formHeader: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 4,
  },
  errorText: {
    color: "red",
  },
});

