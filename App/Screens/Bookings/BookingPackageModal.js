// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   Text,
//   Alert,
//   TouchableOpacity,
//   ToastAndroid,
//   Modal,
// } from "react-native";
// import { Calendar } from "react-native-calendars";
// import {
//   Button,
//   Menu,
//   Chip,
//   Divider,
//   ActivityIndicator,
//   Icon,
//   Checkbox,
// } from "react-native-paper";
// import moment from "moment";
// import { showAvailability } from "../Api/Allapi";
// import { Colors } from "../Config/Config";
// import { RAZORPAY_KEY_ID } from "../Config/Config";
// import UserContext from "../../context/UserContext";
// import BookingSuccessModal from "./SucessfullModa";
// import TermsAndConditions from "./TermsAndConditions";
// import { BaseUrl } from "../Api/BaseUrl";
// import axios from "axios";
// import RazorpayCheckout from "react-native-razorpay";

// const BookingPackageModal = ({
//   packageId,
//   data,
//   days,
//   prices,
//   packageDuration,
//   totalDays,
//   index,
//   close,
//   selectedClasses,
//   saveData,
//   extendedValidityEndDate, // Add this prop
// }) => {
//   console.log('====================================');
//   console.log("BookingPackageModal",data,"BookingPackageModal");
//   console.log("BookingPackageModal - All Durations:", data.availability.map(item => item.duration));
//   console.log('====================================');
//   const [markedDates, setMarkedDates] = useState({});
//   const [selectedClassIndex, setSelectedClassIndex] = useState(index);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [storedata, setStoreData] = useState([]);
//   const [classid, setClassId] = useState("");
//   const { userId, user } = useContext(UserContext);
//   const [SingleLocation, setSingleLocation] = useState([]);
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [TNCModal, setTNCModal] = useState(false);
//   const [isTnc, setIsTnc] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   // Function to calculate the maximum date for calendar
//   const getMaxDate = () => {
//     if (extendedValidityEndDate) {
//       return moment(extendedValidityEndDate).format("YYYY-MM-DD");
//     } else {
//       return moment().add(packageDuration, "days").format("YYYY-MM-DD");
//     }
//   };

//   // Function to check if a date is within validity period
//   const isDateWithinValidity = (date) => {
//     const checkDate = moment(date);
//     const today = moment().startOf("day");

//     if (extendedValidityEndDate) {
//       const extendedEnd = moment(extendedValidityEndDate).startOf("day");
//       return checkDate.isSameOrAfter(today) && checkDate.isSameOrBefore(extendedEnd);
//     } else {
//       const normalEnd = moment().add(packageDuration, "days").startOf("day");
//       return checkDate.isSameOrAfter(today) && checkDate.isSameOrBefore(normalEnd);
//     }
//   };

//   useEffect(() => {
//     if (!data) return;
//     const filter = selectedClasses?.filter((e) => e?.className == data?.name);
//     setStoreData(filter);
//     markCalendarDates(data?.availability, data?.name, filter);
//   }, [data]);

//   function generateRandomNumbers() {
//     let randomNumbers = [];
//     for (let i = 0; i < 10; i++) {
//       randomNumbers.push(Math.floor(Math.random() * 100) + 1); // Generates a random number between 1 and 100
//     }
//     return randomNumbers.join();
//   }

//   const markCalendarDates = (availability, name, datass) => {
//     const availabilityData = {};
//     const currentDate = moment().startOf("day");
//     const maxDate = getMaxDate();
//     const validityTill = moment(maxDate);

//     // Create a Set of valid days for O(1) lookup
//     const validDays = new Set(availability?.map((item) => item?.day));

//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format("YYYY-MM-DD");
//       const selectedClass = name || "No Class";

//       // Check if date is within validity period
//       if (isDateWithinValidity(dateString)) {
//         if (validDays.has(currentDate.day())) {
//           if (
//             datass?.some(
//               (entry) =>
//                 entry.date === moment(currentDate).format("YYYY-MM-DD") &&
//                 entry.className === selectedClass
//             )
//           ) {
//             availabilityData[dateString] = {
//               customStyles: {
//                 container: {
//                   backgroundColor: "orangered",
//                 },
//                 text: {
//                   color: "white",
//                 },
//               },
//             };
//           } else {
//             availabilityData[dateString] = {
//               customStyles: {
//                 container: {
//                   backgroundColor: Colors?.primary,
//                 },
//                 text: {
//                   color: "white",
//                 },
//               },
//             };
//           }
//         } else {
//           availabilityData[dateString] = {
//             customStyles: {
//               container: {
//                 backgroundColor: "#f0f0f0", // Light gray for disabled dates
//               },
//               text: {
//                 color: "#d0d0d0",
//               },
//             },
//             disabled: true,
//             disableTouchEvent: true,
//           };
//         }
//       } else {
//         // Date is outside validity period
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: "#f0f0f0", // Light gray for disabled dates
//             },
//             text: {
//               color: "#d0d0d0",
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//       }

//       currentDate.add(1, "day");
//     }

//     setMarkedDates(availabilityData);
//   };

//   const updateDisabledDates = () => {
//     const disabledDates = {};

//     storedata.forEach((entry) => {
//       // Check if the date and className match any entry in storedata
//       const matchClassDate = storedata.some(
//         (item) => item.date === entry.date && item.className === entry.className
//       );

//       if (matchClassDate) {
//         // currently no extra UI change needed
//       }
//     });

//     setMarkedDates((prev) => ({
//       ...prev,
//       ...disabledDates,
//     }));
//   };

//   const selectedDates = (date) => {
//     const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

//     if (totalSelected >= totalDays) {
//       if (totalSelected >= totalDays) {
//         Alert.alert(
//           `Only ${days} sessions available. Please save and proceed to book.`
//         );
//         return;
//       }
//       return;
//     }

//     // Check if selected date is within validity period
//     if (!isDateWithinValidity(date)) {
//       if (extendedValidityEndDate) {
//         Alert.alert(
//           "Date not available",
//           `Please select a date before ${moment(extendedValidityEndDate).format('DD MMM YYYY')}`
//         );
//       } else {
//         Alert.alert(
//           "Date not available",
//           `Please select a date within ${packageDuration} days from today`
//         );
//       }
//       return;
//     }

//     handleDateSelect(date);
//   };

//   const handleDateSelect = (date) => {
//     const selectedClass = data?.name || "No Class";

//     if (
//       storedata.some(
//         (entry) => entry.date === date && entry.className === selectedClass
//       )
//     ) {
//       Alert.alert("This date is already selected for the same class!");
//       return;
//     }

//     setSelectedDate(date);
//     Showdate(date, data?._id);
//     setClassId(data?._id);
//   };

//   const Showdate = (date, classId) => {
//     setLoading(true);
//     showAvailability(moment(date)?.format("DD-MM-YYYY"), classId)
//       .then((res) => {
//         processAvailabilityData(res);
//         setShowAvailability(res);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   };

//   const processAvailabilityData = (availability) => {
//     if (availability && availability?.slots) {
//       const availableSlots = availability?.slots?.map((slot) => ({
//         time: slot?.time,
//         locations: slot?.locations?.map((location) => ({
//           ...location,
//           key: location?._id,
//           value: location?.name,
//         })),
//       }));

//       if (availableSlots.length > 0) {
//         const firstSlot = availableSlots[0];
//         setSelectedTime(firstSlot?.time);
//         setSelectedLocation(firstSlot?.locations[0]);
//         setLocations(firstSlot?.locations);
//         setSingleLocation(firstSlot?.locations[0]?.name);
//       }
//     }
//   };

//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;
//     const newData = location?.map((loc) => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTime(time);
//   };

//   const handleLocationSelect = (location) => {
//     setSelectedLocation(location);
//     setMenuVisible(false);
//   };

//   // const handleContinue = () => {
//   //   const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

//   //   if (totalSelected >= totalDays) {
//   //     Alert.alert(
//   //       `Only ${days} sessions available. Please save and proceed to book.`
//   //     );
//   //     return;
//   //   }

//   //   if (selectedDate && selectedTime && selectedLocation) {
//   //     const selectedClass = data?.name || "No Class";
//   //     const newEntry = {
//   //       index: generateRandomNumbers(),
//   //       classId: classid,
//   //       className: data?.name,
//   //       user: userId,
//   //       dates: selectedDate,
//   //       date: selectedDate,
//   //       duration: 9,
//   //       time: selectedTime,
//   //       location: selectedLocation,
//   //       amount: prices,
//   //       people: 1,
//   //     };

//   //     if (
//   //       storedata.some(
//   //         (entry) =>
//   //           entry.date === selectedDate && entry.className === selectedClass
//   //       )
//   //     ) {
//   //       Alert.alert("This date is already selected for the same class!");
//   //       return;
//   //     }

//   //     setStoreData((prev) => [...prev, newEntry]);
//   //     markCalendarDates(data?.availability, data?.name, [...storedata, newEntry]);
//   //     updateDisabledDates();
//   //     setSelectedDate(null);
//   //     setSelectedTime(null);
//   //     setSelectedLocation(null);
//   //   }
//   // };

//   // called from TermsAndConditions modal when user accepts T&C

//   const handleContinue = () => {
//   const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

//   if (totalSelected >= totalDays) {
//     Alert.alert(
//       `Only ${days} sessions available. Please save and proceed to book.`
//     );
//     return;
//   }

//   if (selectedDate && selectedTime && selectedLocation) {
//     const selectedClass = data?.name || "No Class";

//     // Get the day of the week for the selected date (0 = Sunday, 1 = Monday, etc.)
//     const selectedDay = moment(selectedDate).day();

//     // Find the matching availability entry for this day and time
//     const matchingAvailability = data.availability.find(item => 
//       item.day === selectedDay && item.time === selectedTime
//     );

//     // Use the duration from availability, fallback to 60 if not found
//     const duration = matchingAvailability?.duration || 60;

//     const newEntry = {
//       index: generateRandomNumbers(),
//       classId: classid,
//       className: data?.name,
//       user: userId,
//       dates: selectedDate,
//       date: selectedDate,
//       duration: duration, // Use the actual duration here
//       time: selectedTime,
//       location: selectedLocation,
//       amount: prices,
//       people: 1,
//     };

//     if (
//       storedata.some(
//         (entry) =>
//           entry.date === selectedDate && entry.className === selectedClass
//       )
//     ) {
//       Alert.alert("This date is already selected for the same class!");
//       return;
//     }

//     setStoreData((prev) => [...prev, newEntry]);
//     markCalendarDates(data?.availability, data?.name, [...storedata, newEntry]);
//     updateDisabledDates();
//     setSelectedDate(null);
//     setSelectedTime(null);
//     setSelectedLocation(null);
//   }
// };

//   const startRazorpayPayment = async () => {
//     if (!storedata || storedata.length === 0) {
//       Alert.alert("Please add at least one booking before payment",);
//       return;
//     }

//     if (!userId) {
//       Alert.alert("User not authenticated",);
//       return;
//     }

//     try {
//       setProcessingPayment(true);

//       // calculate total amount (if your pricing is per session)
//       const totalAmount = prices;

//       // Prepare payload expected by your backend: packageId, user, amount, bookings
//       const payload = {
//         packageId: packageId,
//         user: userId,
//         amount: totalAmount,
//         bookings: storedata.map((b) => ({
//           classId: b.classId,
//           date: b.date,
//           time: b.time,
//           location: b.location,
//           classDuration: b.duration,
//           className: b.className,
//           amount: b.amount,
//         })),
//       };

//       // 1) Call backend to create Razorpay order and pending records
//       const createRes = await axios.post(`${BaseUrl}create-package-order`, payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!createRes?.data?.orderId) {
//         throw new Error("Failed to create order on server");
//       }

//       const orderId = createRes.data.orderId;
//       const orderAmount = createRes.data.amount || Math.round(totalAmount * 100); // paise

//       // 2) Open Razorpay checkout
//       const options = {
//         description: `Payment for package ${packageId}`,
//         image: "", // optional
//         currency: "INR",
//         key: RAZORPAY_KEY_ID,
//         amount: orderAmount, // amount in paise
//         order_id: orderId,
//         name: data?.name || "Package Booking",
//         prefill: {
//           email: user?.email || "",
//           contact: user?.phone || "",
//           name: user?.name || "",
//         },
//         theme: { color: Colors.primary || "#528FF0" },
//       };

//       RazorpayCheckout.open(options)
//         .then(async (paymentResult) => {
//           // paymentResult will contain razorpay_payment_id, razorpay_order_id, razorpay_signature
//           const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

//           // 3) Verify payment at backend
//           try {
//             const verifyRes = await axios.post(`${BaseUrl}verify-package-payment`, {
//               razorpay_order_id,
//               razorpay_payment_id,
//               razorpay_signature,
//             }, {
//               headers: { "Content-Type": "application/json" },
//             });

//             if (verifyRes.data && verifyRes.data.success) {
//               Alert.alert("Payment successful",);

//               // Notify parent & close modal (persist bookings to local parent store if desired)
//               // Save created bookings by calling saveData (your parent likely handles finalizing)
//               saveData(storedata);

//               // Show success modal or any success flow
//               setOverviewModal(true);

//               // Close this booking modal after a short delay to let user see success modal if needed
//               setTimeout(() => {
//                 setProcessingPayment(false);
//                 close();
//               }, 1000);
//             } else {
//               Alert.alert("Payment verification failed on server",);
//               setProcessingPayment(false);
//             }
//           } catch (verifyErr) {
//             console.error("verify error", verifyErr?.response?.data || verifyErr.message);
//             Alert.alert("Payment verification error",);
//             setProcessingPayment(false);
//           }
//         })
//         .catch((err) => {
//           console.error("razorpay checkout error", err);
//           Alert.alert("Payment cancelled or failed",);
//           setProcessingPayment(false);
//         });
//     } catch (err) {
//       console.error("startRazorpayPayment error:", err?.response?.data || err.message);
//       Alert.alert("Failed to start payment: " + (err?.response?.data?.message || "Error"));
//       setProcessingPayment(false);
//     }
//   };

//   const paymentdata = () => {
//     // opens T&C which will call startRazorpayPayment when accepted
//     setTNCModal(true);
//   };

//   const convertTo12HourFormat = (time) => {
//     const [hourStr, minute] = time.split(":");
//     const hour = parseInt(hourStr, 10);
//     const period = hour >= 12 ? "PM" : "AM";
//     const hour12 = hour % 12 || 12;
//     return `${hour12}:${minute} ${period}`;
//   };

//   return (
//     <>
//       <ScrollView style={styles.detailsContainer}>
//         <BookingSuccessModal isVisible={overviewModal} onClose={() => setOverviewModal(false)} />
//         <TermsAndConditions
//           modal={TNCModal}
//           setModal={() => setTNCModal(false)}
//           funcitonCall={() => startRazorpayPayment()}
//         />

//         <View style={styles.container}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Text
//               style={[styles.classText, { flex: 1, flexShrink: 1, marginRight: 10 }]}
//               numberOfLines={2}
//             >
//               {data?.name}
//             </Text>
//             <TouchableOpacity
//               style={{
//                 backgroundColor: "red",
//                 padding: 10,
//                 borderRadius: 50,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 alignContent: "center",
//                 paddingHorizontal: 15,
//               }}
//               onPress={close}
//             >
//               <Text style={{ color: "white", fontSize: 20, marginTop: -5 }}>x</Text>
//             </TouchableOpacity>
//           </View>

//           <Calendar
//             style={styles.calendar}
//             markedDates={markedDates}
//             minDate={moment()?.format("YYYY-MM-DD")}
//             markingType={"custom"}
//             maxDate={getMaxDate()} // Use the new function here
//             hideExtraDays={true}
//             onDayPress={(day) => selectedDates(day?.dateString)}
//           />

//           <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
//             {[
//               { name: "Available", color: Colors?.primary },
//               { name: "Selected", color: "orangered" },
//               { name: "Not Available", color: "lightgray" },
//             ]?.map((e) => (
//               <View style={{ display: "flex", flexDirection: "row", gap: 5 }} key={e.name}>
//                 <View style={{ height: 20, width: 20, borderRadius: 50, backgroundColor: e?.color }} />
//                 <Text style={{ color: "black" }}>{e?.name}</Text>
//               </View>
//             ))}
//           </View>

//           {loading ? (
//             <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
//           ) : (
//             selectedDate &&
//             showAvailabilitys && (
//               <>
//                 <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>

//                 <View style={styles.timeContainer}>
//                   {showAvailabilitys?.slots?.map((slot, idx) => (
//                     <Button
//                       key={idx}
//                       mode={selectedTime === slot?.time ? "contained" : "outlined"}
//                       onPress={() => handleTimeSelect(slot?.time, slot?.locations)}
//                       style={styles.timeButton}
//                       labelStyle={{ fontSize: 14 }}
//                       numberOfLines={1}
//                     >
//                       {convertTo12HourFormat(slot?.time)}
//                     </Button>
//                   ))}
//                 </View>

//                 <Button mode="outlined" onPress={() => setMenuVisible(true)}>
//                   {selectedLocation?.value ?? "Select Location"}
//                 </Button>

//                 {menuVisible && (
//                   <View
//                     style={{
//                       elevation: 3,
//                       backgroundColor: "white",
//                       borderRadius: 10,
//                       marginBottom: 10,
//                       borderWidth: 1,
//                       borderColor: "lightgray",
//                     }}
//                   >
//                     {locations.map((location, i) => (
//                       <TouchableOpacity
//                         key={location.key}
//                         onPress={() => handleLocationSelect(location)}
//                         style={{
//                           padding: 10,
//                           width: "90%",
//                           alignSelf: "center",
//                           borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
//                           borderColor: "lightgray",
//                         }}
//                       >
//                         <Text style={{ color: "black" }}>
//                           {selectedLocation?.key === location.key ? `✓ ${location.value}` : location.value}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}

//                 <Text></Text>
//                 <Button
//                   mode="contained"
//                   onPress={handleContinue}
//                   style={{
//                     backgroundColor: Colors.primary,
//                     width: "40%",
//                     alignSelf: "center",
//                     borderRadius: 10,
//                   }}
//                 >
//                   Add to List
//                 </Button>
//               </>
//             )
//           )}

//           <View style={{ padding: 20 }}>
//             {storedata.map((entry, index) => (
//               <View
//                 key={index}
//                 style={{
//                   marginBottom: 15,
//                   padding: 12,
//                   backgroundColor: "#f9f9f9",
//                   borderRadius: 8,
//                   shadowColor: "#000",
//                   shadowOpacity: 0.1,
//                   shadowRadius: 5,
//                   elevation: 2,
//                 }}
//               >
//                 <Text style={[styles.selectedTitle, { marginBottom: 4 }]}>{entry?.className}</Text>

//                 <Text style={styles.selectedDate}>📅 {moment(entry?.date).format("MMM DD, YYYY")}</Text>

//                 <Text style={styles.selectedTime}>⏰ {convertTo12HourFormat(entry?.time)}</Text>

//                 <Text style={styles.selectedLocation}>📍 Location: {entry?.location?.name}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <View
//           style={{
//             position: "absolute",
//             bottom: 0,
//             backgroundColor: "white",
//             padding: 10,
//             flexDirection: "row",
//             width: "100%",
//             justifyContent: "flex-end",
//           }}
//         >
//           <Button
//             mode="contained"
//             onPress={() => {
//               // If you want to continue saving locally without payment:
//               saveData(storedata);
//               close();

//               // If you want to trigger payment flow, call paymentdata()
//               // NOTE: T&C will call startRazorpayPayment
//               if (!storedata || storedata.length === 0) {
//                 // Alert.alert("Please add at least one booking",);
//                 return;
//               }
//               // setTNCModal(true);
//             }}
//             style={{
//               borderRadius: 10,
//               paddingVertical: 3,
//               backgroundColor: Colors.primary,
//             }}
//           >
//             {processingPayment ? "Processing..." : "SAVE"}
//           </Button>
//         </View>
//       </ScrollView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 10,
//     position: "relative",
//     marginBottom: 30,
//   },
//   detailsContainer: {
//     marginVertical: 60,
//     marginHorizontal: 20,
//     position: "relative",
//     width: "90%",
//   },
//   calendar: {
//     marginVertical: 20,
//   },
//   loader: {
//     marginVertical: 10,
//   },
//   classText: {
//     fontSize: 22,
//     color: Colors.primary,
//     fontWeight: "500",
//     marginLeft: 10,
//   },
//   dateText: {
//     color: "black",
//     marginTop: 10,
//   },
//   timeContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     marginTop: 10,
//   },
//   timeButton: {
//     margin: 5,
//     paddingHorizontal: 16,
//     minWidth: 80,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//   },

//   selectedTitle: {
//     color: "black",
//     fontSize: 18,
//     fontWeight: "600",
//     flexWrap: "wrap",
//   },

//   selectedDate: {
//     color: "#333",
//     fontSize: 14,
//     marginBottom: 2,
//   },

//   selectedTime: {
//     color: "#333",
//     fontSize: 14,
//     marginBottom: 2,
//   },

//   selectedLocation: {
//     color: "#333",
//     fontSize: 14,
//   },

//   divider: {
//     marginVertical: 10,
//   },
//   selectedClassInfo: {
//     marginTop: 10,
//   },
//   listHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   listItem: {
//     backgroundColor: "#f0f0f0",
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 5,
//   },
// });

// export default BookingPackageModal;

// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   Text,
//   Alert,
//   TouchableOpacity,
//   Modal,
// } from "react-native";
// import { Calendar } from "react-native-calendars";
// import {
//   Button,
//   Menu,
//   Chip,
//   Divider,
//   ActivityIndicator,
//   Icon,
//   Checkbox,
// } from "react-native-paper";
// import moment from "moment";
// import { showAvailability } from "../Api/Allapi";
// import { Colors } from "../Config/Config";
// import { RAZORPAY_KEY_ID } from "../Config/Config";
// import UserContext from "../../context/UserContext";
// import BookingSuccessModal from "./SucessfullModa";
// import TermsAndConditions from "./TermsAndConditions";
// import { BaseUrl } from "../Api/BaseUrl";
// import axios from "axios";
// import RazorpayCheckout from "react-native-razorpay";
// import Toast from 'react-native-toast-message';

// const BookingPackageModal = ({
//   packageId,
//   data,
//   days,
//   prices,
//   packageDuration,
//   totalDays,
//   index,
//   close,
//   selectedClasses,
//   saveData,
//   extendedValidityEndDate,
//   userPackage,
// }) => {
//   console.log('====================================');
//   console.log("BookingPackageModal", data, "BookingPackageModal");
//   console.log("BookingPackageModal - All Durations:", data.availability.map(item => item.duration));
//   console.log("User Package Data:", userPackage);
//   console.log('====================================');

//   const [markedDates, setMarkedDates] = useState({});
//   const [selectedClassIndex, setSelectedClassIndex] = useState(index);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [storedata, setStoreData] = useState([]);
//   const [classid, setClassId] = useState("");
//   const { userId, user } = useContext(UserContext);
//   const [SingleLocation, setSingleLocation] = useState([]);
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [TNCModal, setTNCModal] = useState(false);
//   const [isTnc, setIsTnc] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);
//   const [classFullDates, setClassFullDates] = useState({});
//   const [availableSlots, setAvailableSlots] = useState([]); // Store all available slots from API

//   // New function to check availability for all times and locations at once
//   // New function to check availability for all times and locations at once
//   const checkAllSlotsAvailability = async (classId, date) => {
//     try {
//       console.log('🔍 CHECKING ALL SLOTS AVAILABILITY:');
//       console.log("Class ID:", classId);
//       console.log("Date:", date);

//       // Extract all unique times and location IDs from class availability
//       const allTimes = [...new Set(data.availability.map(item => item.time))];

//       // Extract only location IDs (not the full objects)
//       const allLocationIds = [...new Set(data.availability.flatMap(item =>
//         item.locations.map(loc => typeof loc === 'object' ? loc._id : loc)
//       ))];

//       console.log("All Times:", allTimes);
//       console.log("All Location IDs:", allLocationIds);

//       const response = await axios.post(`${BaseUrl}preview-booking-class-availbality`, {
//         classId: classId,
//         date: date,
//         times: allTimes,
//         locationIds: allLocationIds  // Send only IDs, not objects
//       });

//       console.log('📊 ALL SLOTS AVAILABILITY RESPONSE:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('❌ ERROR CHECKING ALL SLOTS AVAILABILITY:', error);
//       return {
//         slots: [],
//         message: "Error checking availability"
//       };
//     }
//   };

//   // Function to get the start date - use createdAt from userPackage if available
//   const getStartDate = () => {
//     if (userPackage?.createdAt) {
//       return moment(userPackage.createdAt).format("YYYY-MM-DD");
//     }
//     return moment().format("YYYY-MM-DD");
//   };

//   // Function to calculate the maximum date for calendar
//   const getMaxDate = () => {
//     if (extendedValidityEndDate) {
//       return moment(extendedValidityEndDate).format("YYYY-MM-DD");
//     } else {
//       return moment(getStartDate()).add(packageDuration, "days").format("YYYY-MM-DD");
//     }
//   };

//   // Function to check if a date is within validity period
//   // Function to check if a date is within validity period
//   // Function to check if a date is within validity period AND not in the past
//   // Function to check if a date is within validity period AND not in the past
//   const isDateWithinValidity = (date) => {
//     const checkDate = moment(date);
//     const bookingStartDate = moment(getBookingStartDate()).startOf("day");
//     const packageStartDate = moment(getStartDate()).startOf("day");

//     // Check if date is before the booking start date (today or future package start)
//     if (checkDate.isBefore(bookingStartDate)) {
//       return false;
//     }

//     // Additional check: date should not be before package start date (safety check)
//     if (checkDate.isBefore(packageStartDate)) {
//       return false;
//     }

//     // Check if date is within the validity end date
//     if (extendedValidityEndDate) {
//       const extendedEnd = moment(extendedValidityEndDate).startOf("day");
//       return checkDate.isSameOrAfter(packageStartDate) && checkDate.isSameOrBefore(extendedEnd);
//     } else {
//       const normalEnd = moment(getStartDate()).add(packageDuration, "days").startOf("day");
//       return checkDate.isSameOrAfter(packageStartDate) && checkDate.isSameOrBefore(normalEnd);
//     }
//   };

//   // Function to log the booking date range
//   const logBookingDateRange = () => {
//     const startDate = getStartDate();
//     const maxDate = getMaxDate();

//     console.log('📅 BOOKING DATE RANGE INFORMATION:');
//     console.log('====================================');
//     console.log('Package Name:', data?.name);
//     console.log('Package Duration:', packageDuration, 'days');
//     console.log('Total Sessions Available:', totalDays);
//     console.log('Booking Start Date:', startDate);
//     console.log('Booking End Date:', maxDate);
//     console.log('Package Created At:', userPackage?.createdAt ? moment(userPackage.createdAt).format("YYYY-MM-DD") : 'Not available');

//     if (extendedValidityEndDate) {
//       console.log('📆 Extended Validity Applied');
//       console.log('Extended End Date:', moment(extendedValidityEndDate).format("YYYY-MM-DD"));
//     } else {
//       console.log('📆 Normal Validity Period');
//       console.log('Validity Period:', startDate, 'to', maxDate);
//     }

//     console.log('Available Days of Week:', data?.availability?.map(item => {
//       const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//       return days[item.day];
//     }));

//     console.log('====================================');
//   };

//   useEffect(() => {
//     if (!data) return;

//     logBookingDateRange();

//     const filter = selectedClasses?.filter((e) => e?.className == data?.name);
//     setStoreData(filter);
//     markCalendarDates(data?.availability, data?.name, filter);
//   }, [data, userPackage, classFullDates]); // Add classFullDates here
//   useEffect(() => {
//     if (data) {
//       logBookingDateRange();
//     }
//   }, [extendedValidityEndDate]);

//   function generateRandomNumbers() {
//     let randomNumbers = [];
//     for (let i = 0; i < 10; i++) {
//       randomNumbers.push(Math.floor(Math.random() * 100) + 1);
//     }
//     return randomNumbers.join();
//   }

//   const markCalendarDates = (availability, name, datass) => {
//     const availabilityData = {};
//     const startDate = moment(getStartDate()).startOf("day");
//     const maxDate = getMaxDate();
//     const validityTill = moment(maxDate);

//     // Create a Set of valid days for O(1) lookup
//     const validDays = new Set(availability?.map((item) => item?.day));

//     let currentDate = startDate.clone();

//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format("YYYY-MM-DD");
//       const selectedClass = name || "No Class";

//       // Check if date is within validity period
//       if (isDateWithinValidity(dateString)) {
//         if (validDays.has(currentDate.day())) {
//           // Check if date is class full - check this FIRST
//           if (classFullDates[dateString]) {
//             availabilityData[dateString] = {
//               customStyles: {
//                 container: {
//                   backgroundColor: "pink",
//                 },
//                 text: {
//                   color: "white",
//                 },
//               },
//               disabled: true,
//               disableTouchEvent: true,
//             };
//           } else if (
//             datass?.some(
//               (entry) =>
//                 entry.date === moment(currentDate).format("YYYY-MM-DD") &&
//                 entry.className === selectedClass
//             )
//           ) {
//             availabilityData[dateString] = {
//               customStyles: {
//                 container: {
//                   backgroundColor: "orangered",
//                 },
//                 text: {
//                   color: "white",
//                 },
//               },
//             };
//           } else {
//             availabilityData[dateString] = {
//               customStyles: {
//                 container: {
//                   backgroundColor: Colors?.primary,
//                 },
//                 text: {
//                   color: "white",
//                 },
//               },
//             };
//           }
//         } else {
//           availabilityData[dateString] = {
//             customStyles: {
//               container: {
//                 backgroundColor: "#f0f0f0",
//               },
//               text: {
//                 color: "#d0d0d0",
//               },
//             },
//             disabled: true,
//             disableTouchEvent: true,
//           };
//         }
//       } else {
//         // Date is outside validity period (either before start or after end)
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: "#f0f0f0",
//             },
//             text: {
//               color: "#d0d0d0",
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//       }

//       currentDate.add(1, "day");
//     }

//     setMarkedDates(availabilityData);
//   };

//   const updateDisabledDates = () => {
//     const disabledDates = {};

//     storedata.forEach((entry) => {
//       const matchClassDate = storedata.some(
//         (item) => item.date === entry.date && item.className === entry.className
//       );

//       if (matchClassDate) {
//         // currently no extra UI change needed
//       }
//     });

//     setMarkedDates((prev) => ({
//       ...prev,
//       ...disabledDates,
//     }));
//   };

//   const selectedDates = async (date) => {
//     const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

//     if (totalSelected >= totalDays) {
//       Toast.show({
//         type: 'info',
//         text1: 'Session Limit',
//         text2: `Only ${days} sessions available. Please save and proceed to book.`,
//       });
//       return;
//     }

//     const checkDate = moment(date);
//     const today = moment().startOf("day");
//     const startDate = getStartDate();

//     // Check if date is in the past
//     if (checkDate.isBefore(today)) {
//       Toast.show({
//         type: 'error',
//         text1: 'Date Not Available',
//         text2: 'Cannot book classes for past dates. Please select today or a future date.',
//       });
//       return;
//     }

//     // Check if selected date is within validity period
//     if (!isDateWithinValidity(date)) {
//       if (checkDate.isBefore(moment(startDate))) {
//         Toast.show({
//           type: 'error',
//           text1: 'Date Not Available',
//           text2: `Cannot book classes before your package start date (${moment(startDate).format('DD MMM YYYY')})`,
//         });

//       } else if (extendedValidityEndDate) {
//         Toast.show({
//           type: 'error',
//           text1: 'Date Not Available',
//           text2: `Please select a date between ${moment(startDate).format('DD MMM YYYY')} and ${moment(extendedValidityEndDate).format('DD MMM YYYY')}`,
//         });
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Date Not Available',
//           text2: `Please select a date between ${moment(startDate).format('DD MMM YYYY')} and ${moment(getMaxDate()).format('DD MMM YYYY')}`,
//         });
//       }
//       return;
//     }

//     // Check if date is already marked as class full
//     if (classFullDates[date]) {
//       Toast.show({
//         type: 'error',
//         text1: 'Class Full',
//         text2: 'This class is full for the selected date. Please select another date.',
//       });
//       return;
//     }

//     handleDateSelect(date);
//   };

//   const handleDateSelect = async (date) => {
//     const selectedClass = data?.name || "No Class";

//     if (
//       storedata.some(
//         (entry) => entry.date === date && entry.className === selectedClass
//       )
//     ) {
//       Toast.show({
//         type: 'info',
//         text1: 'Duplicate Selection',
//         text2: 'This date is already selected for the same class!',
//       }); return;
//     }

//     setSelectedDate(date);
//     console.log('====================================');
//     console.log("📅 DATE SELECTED:");
//     console.log("Selected Date:", date);
//     console.log("Class ID:", data?._id);
//     console.log('====================================');

//     setClassId(data?._id);

//     // Call the new API to check all slots availability
//     setLoading(true);
//     const availabilityResponse = await checkAllSlotsAvailability(data?._id, date);
//     setLoading(false);

//     if (availabilityResponse.slots && availabilityResponse.slots.length > 0) {
//       console.log('🎯 PROCESSING AVAILABLE SLOTS:');

//       // Filter only available slots
//       const availableSlotsData = availabilityResponse.slots.filter(slot => slot.bookingAvailable);

//       if (availableSlotsData.length === 0) {
//         Toast.show({
//           type: 'error',
//           text1: 'Class Full',
//           text2: 'All slots for this date are fully booked. Please select another date.',
//         });

//         // Mark this date as class full in the calendar IMMEDIATELY
//         setClassFullDates(prev => ({
//           ...prev,
//           [date]: true
//         }));

//         // Update calendar to show pink color for class full date IMMEDIATELY
//         markCalendarDates(data?.availability, data?.name, storedata);

//         // RESET the selected date since it's class full
//         setSelectedDate(null);
//         setShowAvailability(null);
//         setAvailableSlots([]);
//         return; // IMPORTANT: Return here to prevent further processing
//       }

//       console.log("Available Slots:", availableSlotsData);
//       setAvailableSlots(availableSlotsData);

//       // Process the available slots to show in UI
//       processAvailableSlotsData(availableSlotsData);
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Availability Error',
//         text2: 'No availability data received',
//       });      // Reset selection on error too
//       setSelectedDate(null);
//       setShowAvailability(null);
//       setAvailableSlots([]);
//     }
//   };

//   const processAvailableSlotsData = (slotsData) => {
//     // Create a mapping of location IDs to location names from the original class data
//     const locationMap = {};
//     data.availability.forEach(avail => {
//       avail.locations.forEach(loc => {
//         const locationId = typeof loc === 'object' ? loc._id : loc;
//         const locationName = typeof loc === 'object' ? loc.name : `Location ${loc}`;
//         locationMap[locationId] = locationName;
//       });
//     });

//     // Group slots by time and their locations
//     const slotsByTime = {};

//     slotsData.forEach(slot => {
//       if (!slotsByTime[slot.time]) {
//         slotsByTime[slot.time] = [];
//       }

//       // Use the location map to get the location name
//       const locationName = locationMap[slot.location] || `Location ${slot.location}`;

//       slotsByTime[slot.time].push({
//         _id: slot.location,
//         name: locationName,
//         key: slot.location,
//         value: locationName
//       });
//     });

//     // Convert to the format expected by the existing UI
//     const formattedSlots = Object.keys(slotsByTime).map(time => ({
//       time: time,
//       locations: slotsByTime[time]
//     }));

//     console.log('🔄 FORMATTED SLOTS FOR UI:', formattedSlots);

//     // Set the first available slot as selected by default
//     if (formattedSlots.length > 0) {
//       const firstSlot = formattedSlots[0];
//       setSelectedTime(firstSlot.time);
//       setSelectedLocation(firstSlot.locations[0]);
//       setLocations(firstSlot.locations);
//     }

//     setShowAvailability({ slots: formattedSlots });
//   };

//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;

//     // Find the slot data for the selected time
//     const selectedSlotData = availableSlots.find(slot =>
//       slot.time === time && slot.location === location[0]?._id
//     );

//     if (selectedSlotData && !selectedSlotData.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Slot Unavailable',
//         text2: 'This slot is no longer available. Please select another time.',
//       });
//       return;
//     }

//     const newData = location?.map((loc) => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTime(time);

//     console.log('====================================');
//     console.log("⏰ TIME SELECTED - ALL DATA:");
//     console.log("Selected Date:", selectedDate);
//     console.log("Class ID:", classid);
//     console.log("Selected Time:", time);
//     console.log("Available Locations:", newData.map(loc => ({ id: loc._id, name: loc.name })));
//     console.log('====================================');
//   };

//   const handleLocationSelect = (location) => {
//     // Check if the selected location-time combination is available
//     const selectedSlot = availableSlots.find(slot =>
//       slot.time === selectedTime && slot.location === location._id
//     );

//     if (selectedSlot && !selectedSlot.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Location Unavailable',
//         text2: 'This location is no longer available for the selected time.',
//       }); return;
//     }

//     setSelectedLocation(location);
//     setMenuVisible(false);

//     console.log('====================================');
//     console.log("📍 LOCATION SELECTED - ALL DATA:");
//     console.log("Selected Date:", selectedDate);
//     console.log("Class ID:", classid);
//     console.log("Selected Time:", selectedTime);
//     console.log("Location ID:", location?._id);
//     console.log("Location Name:", location?.name);
//     console.log('====================================');
//   };

//   const handleContinue = async () => {
//     const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

//     if (totalSelected >= totalDays) {
//       Toast.show({
//         type: 'info',
//         text1: 'Session Limit',
//         text2: `Only ${days} sessions available. Please save and proceed to book.`,
//       });
//       return;
//     }

//     if (selectedDate && selectedTime && selectedLocation) {
//       const selectedClass = data?.name || "No Class";

//       const selectedDay = moment(selectedDate).day();

//       const matchingAvailability = data.availability.find(item =>
//         item.day === selectedDay && item.time === selectedTime
//       );

//       const duration = matchingAvailability?.duration || 60;

//       // Double check availability from our stored available slots
//       const slotAvailability = availableSlots.find(slot =>
//         slot.time === selectedTime && slot.location === selectedLocation._id
//       );

//       if (!slotAvailability || !slotAvailability.bookingAvailable) {
//         Toast.show({
//           type: 'error',
//           text1: 'Slot Unavailable',
//           text2: 'This slot is no longer available. Please select another time or location.',
//         });
//         return;
//       }

//       const newEntry = {
//         index: generateRandomNumbers(),
//         classId: classid,
//         className: data?.name,
//         user: userId,
//         dates: selectedDate,
//         date: selectedDate,
//         duration: duration,
//         time: selectedTime,
//         location: selectedLocation,
//         amount: prices,
//         people: 1,
//       };

//       if (
//         storedata.some(
//           (entry) =>
//             entry.date === selectedDate && entry.className === selectedClass
//         )
//       ) {
//         Toast.show({
//           type: 'info',
//           text1: 'Duplicate Selection',
//           text2: 'This date is already selected for the same class!',
//         });
//         return;
//       }

//       // COMPREHENSIVE LOGGING - ALL 4 DATA POINTS TOGETHER
//       console.log('====================================');
//       console.log("✅ FINAL SELECTION - ALL 4 DATA POINTS:");
//       console.log("1. Selected Date:", selectedDate);
//       console.log("2. Class ID:", classid);
//       console.log("3. Selected Time:", selectedTime);
//       console.log("4. Location ID:", selectedLocation?._id);
//       console.log("Additional Info:");
//       console.log("   - Class Name:", data?.name);
//       console.log("   - Location Name:", selectedLocation?.name);
//       console.log("   - Duration:", duration, "minutes");
//       console.log("   - Availability:", "Available - Class has space");
//       console.log('====================================');

//       setStoreData((prev) => [...prev, newEntry]);

//       // Add success toast
//       Toast.show({
//         type: 'success',
//         text1: 'Added to List',
//         text2: 'Class has been added to your booking list',
//       });

//       markCalendarDates(data?.availability, data?.name, [...storedata, newEntry]);
//       updateDisabledDates();
//       setSelectedDate(null);
//       setSelectedTime(null);
//       setSelectedLocation(null);
//       setAvailableSlots([]);
//       setShowAvailability(null);
//     }
//   };

//   const convertTo12HourFormat = (time) => {
//     const [hourStr, minute] = time.split(":");
//     const hour = parseInt(hourStr, 10);
//     const period = hour >= 12 ? "PM" : "AM";
//     const hour12 = hour % 12 || 12;
//     return `${hour12}:${minute} ${period}`;
//   };

//   const getBookingStartDate = () => {
//     const today = moment().startOf("day");
//     const packageStartDate = moment(getStartDate()).startOf("day");

//     // If package start date is in future, use that, otherwise use today
//     if (packageStartDate.isAfter(today)) {
//       return packageStartDate.format("YYYY-MM-DD");
//     }
//     return today.format("YYYY-MM-DD");
//   };


//   return (
//     <>
//       <ScrollView style={styles.detailsContainer}>
//         <BookingSuccessModal isVisible={overviewModal} onClose={() => setOverviewModal(false)} />
//         <TermsAndConditions
//           modal={TNCModal}
//           setModal={() => setTNCModal(false)}
//           funcitonCall={() => startRazorpayPayment()}
//         />

//         <View style={styles.container}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Text
//               style={[styles.classText, { flex: 1, flexShrink: 1, marginRight: 10 }]}
//               numberOfLines={2}
//             >
//               {data?.name}
//             </Text>
//             <TouchableOpacity
//               style={{
//                 backgroundColor: "red",
//                 padding: 10,
//                 borderRadius: 50,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 alignContent: "center",
//                 paddingHorizontal: 15,
//               }}
//               onPress={close}
//             >
//               <Text style={{ color: "white", fontSize: 20, marginTop: -5 }}>x</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Updated Date Range Info Display */}
//           <View style={styles.dateRangeInfo}>
//             <Text style={styles.dateRangeTitle}>Booking Period:</Text>
//             <Text style={styles.dateRangeText}>
//               {moment(getBookingStartDate()).format("DD MMM YYYY")} to {moment(getMaxDate()).format("DD MMM YYYY")}
//             </Text>
//             <Text style={styles.noteText}>
//               {moment(getStartDate()).isAfter(moment())
//                 ? `(From your package start date until expiry)`
//                 : `(From today until your package expiry)`
//               }
//             </Text>
//             {userPackage?.createdAt && (
//               <Text style={styles.packageCreatedText}>
//                 Package starts from: {moment(userPackage.createdAt).format("DD MMM YYYY")}
//               </Text>
//             )}
//             {extendedValidityEndDate && (
//               <Text style={styles.extendedText}>(Extended Validity Applied)</Text>
//             )}
//           </View>

//           <Calendar
//             style={styles.calendar}
//             markedDates={markedDates}
//             minDate={getBookingStartDate()} // Use the new function here
//             markingType={"custom"}
//             maxDate={getMaxDate()}
//             hideExtraDays={true}
//             onDayPress={(day) => selectedDates(day?.dateString)}
//           />

//           <View style={{ display: "flex", flexDirection: "row", gap: 10, flexWrap: 'wrap' }}>
//             {[
//               { name: "Available", color: Colors?.primary },
//               { name: "Selected", color: "orangered" },
//               { name: "Class Full", color: "pink" },
//               { name: "Not Available", color: "lightgray" },
//             ]?.map((e) => (
//               <View style={{ display: "flex", flexDirection: "row", gap: 5, alignItems: 'center' }} key={e.name}>
//                 <View style={{ height: 20, width: 20, borderRadius: 50, backgroundColor: e?.color }} />
//                 <Text style={{ color: "black", fontSize: 12 }}>{e?.name}</Text>
//               </View>
//             ))}
//           </View>

//           {loading ? (
//             <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
//           ) : (
//             selectedDate &&
//             showAvailabilitys && (
//               <>
//                 <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>
//                 {/* <Text style={styles.availableText}>
//                   Available Slots: {availableSlots.filter(slot => slot.bookingAvailable).length}
//                 </Text> */}

//                 <View style={styles.timeContainer}>
//                   {showAvailabilitys?.slots?.map((slot, idx) => (
//                     <Button
//                       key={idx}
//                       mode={selectedTime === slot?.time ? "contained" : "outlined"}
//                       onPress={() => handleTimeSelect(slot?.time, slot?.locations)}
//                       style={styles.timeButton}
//                       labelStyle={{ fontSize: 14 }}
//                       numberOfLines={1}
//                     >
//                       {convertTo12HourFormat(slot?.time)}
//                     </Button>
//                   ))}
//                 </View>

//                 <Button mode="outlined" onPress={() => setMenuVisible(true)}>
//                   {selectedLocation?.value ?? "Select Location"}
//                 </Button>

//                 {menuVisible && (
//                   <View
//                     style={{
//                       elevation: 3,
//                       backgroundColor: "white",
//                       borderRadius: 10,
//                       marginBottom: 10,
//                       borderWidth: 1,
//                       borderColor: "lightgray",
//                     }}
//                   >
//                     {locations.map((location, i) => (
//                       <TouchableOpacity
//                         key={location.key}
//                         onPress={() => handleLocationSelect(location)}
//                         style={{
//                           padding: 10,
//                           width: "90%",
//                           alignSelf: "center",
//                           borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
//                           borderColor: "lightgray",
//                         }}
//                       >
//                         <Text style={{ color: "black" }}>
//                           {selectedLocation?.key === location.key ? `✓ ${location.value}` : location.value}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}

//                 <Text></Text>
//                 <Button
//                   mode="contained"
//                   onPress={handleContinue}
//                   style={{
//                     backgroundColor: Colors.primary,
//                     width: "40%",
//                     alignSelf: "center",
//                     borderRadius: 10,
//                   }}
//                   disabled={loading}
//                 >
//                   {loading ? "Checking..." : "Add to List"}
//                 </Button>
//               </>
//             )
//           )}

//           <View style={{ padding: 20 }}>
//             {storedata.map((entry, index) => (
//               <View
//                 key={index}
//                 style={{
//                   marginBottom: 15,
//                   padding: 12,
//                   backgroundColor: "#f9f9f9",
//                   borderRadius: 8,
//                   shadowColor: "#000",
//                   shadowOpacity: 0.1,
//                   shadowRadius: 5,
//                   elevation: 2,
//                 }}
//               >
//                 <Text style={[styles.selectedTitle, { marginBottom: 4 }]}>{entry?.className}</Text>
//                 <Text style={styles.selectedDate}>📅 {moment(entry?.date).format("MMM DD, YYYY")}</Text>
//                 <Text style={styles.selectedTime}>⏰ {convertTo12HourFormat(entry?.time)}</Text>
//                 <Text style={styles.selectedLocation}>📍 Location: {entry?.location?.name}</Text>
//               </View>
//             ))}
//           </View>
//         </View>
//         <View
//           style={{
//             position: "absolute",
//             bottom: 0,
//             backgroundColor: "white",
//             padding: 10,
//             flexDirection: "row",
//             width: "100%",
//             justifyContent: "flex-end",
//           }}
//         >
//           <Button
//             mode="contained"
//             onPress={() => {
//               if (!storedata || storedata.length === 0) {
//                 Toast.show({
//                   type: 'error',
//                   text1: 'No Bookings',
//                   text2: 'Please add at least one booking before saving',
//                 }); return;
//               }
//               saveData(storedata);
//               close();
//             }}
//             style={{
//               borderRadius: 10,
//               paddingVertical: 3,
//               backgroundColor: Colors.primary,
//             }}
//           >
//             {processingPayment ? "Processing..." : "SAVE"}
//           </Button>
//         </View>
//       </ScrollView>
//     </>
//   );
// };

// // Add the new style for available text
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 10,
//     position: "relative",
//     marginBottom: 30,
//   },
//   detailsContainer: {
//     marginVertical: 60,
//     marginHorizontal: 20,
//     position: "relative",
//     width: "90%",
//   },
//   calendar: {
//     marginVertical: 20,
//   },
//   loader: {
//     marginVertical: 10,
//   },
//   classText: {
//     fontSize: 22,
//     color: Colors.primary,
//     fontWeight: "500",
//     marginLeft: 10,
//   },
//   dateText: {
//     color: "black",
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   availableText: {
//     color: Colors.primary,
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   timeContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     marginTop: 10,
//   },
//   timeButton: {
//     margin: 5,
//     paddingHorizontal: 16,
//     minWidth: 80,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//   },
//   selectedTitle: {
//     color: "black",
//     fontSize: 18,
//     fontWeight: "600",
//     flexWrap: "wrap",
//   },
//   selectedDate: {
//     color: "#333",
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   selectedTime: {
//     color: "#333",
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   selectedLocation: {
//     color: "#333",
//     fontSize: 14,
//   },
//   divider: {
//     marginVertical: 10,
//   },
//   selectedClassInfo: {
//     marginTop: 10,
//   },
//   listHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   listItem: {
//     backgroundColor: "#f0f0f0",
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 5,
//   },
//   dateRangeInfo: {
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     borderLeftWidth: 4,
//     borderLeftColor: Colors.primary,
//   },
//   dateRangeTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   dateRangeText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: Colors.primary,
//   },
//   packageCreatedText: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 2,
//   },
//   extendedText: {
//     fontSize: 12,
//     color: '#28a745',
//     fontStyle: 'italic',
//     marginTop: 2,
//   },
// });

// export default BookingPackageModal;

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  Button,
  Menu,
  Chip,
  Divider,
  ActivityIndicator,
  Icon,
  Checkbox,
} from "react-native-paper";
import moment from "moment";
import { showAvailability } from "../Api/Allapi";
import { Colors } from "../Config/Config";
import { RAZORPAY_KEY_ID } from "../Config/Config";
import UserContext from "../../context/UserContext";
import BookingSuccessModal from "./SucessfullModa";
import TermsAndConditions from "./TermsAndConditions";
import { BaseUrl } from "../Api/BaseUrl";
import axios from "axios";
import RazorpayCheckout from "react-native-razorpay";

// Remove the Toast import since we're using Alert
// import Toast from 'react-native-toast-message';

const BookingPackageModal = ({
  packageId,
  data,
  days,
  prices,
  packageDuration,
  totalDays,
  index,
  close,
  selectedClasses,
  saveData,
  extendedValidityEndDate,
  userPackage,
}) => {
  console.log('====================================');
  console.log("BookingPackageModal", data, "BookingPackageModal");
  console.log("BookingPackageModal - All Durations:", data.availability.map(item => item.duration));
  console.log("User Package Data:", userPackage);
  console.log('====================================');

  const [markedDates, setMarkedDates] = useState({});
  const [selectedClassIndex, setSelectedClassIndex] = useState(index);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [storedata, setStoreData] = useState([]);
  const [classid, setClassId] = useState("");
  const { userId, user } = useContext(UserContext);
  const [SingleLocation, setSingleLocation] = useState([]);
  const [overviewModal, setOverviewModal] = useState(false);
  const [TNCModal, setTNCModal] = useState(false);
  const [isTnc, setIsTnc] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [classFullDates, setClassFullDates] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]); // Store all available slots from API
  const [tempSelectedDate, setTempSelectedDate] = useState(null);


  const rebuildCalendarWithTempSelection = (tempDate) => {
    const availabilityData = {};
    const startDate = moment(getStartDate()).startOf("day");
    const validityTill = moment(getMaxDate());
    const validDays = new Set(data?.availability?.map(item => item.day));
    const selectedClass = data?.name || "No Class";

    let currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(validityTill)) {
      const dateString = currentDate.format("YYYY-MM-DD");

      if (!isDateWithinValidity(dateString)) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: "#f0f0f0" },
            text: { color: "#d0d0d0" },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      } else if (classFullDates[dateString]) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: "pink" },
            text: { color: "white" },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      } else if (
        storedata?.some(
          e => e.date === dateString && e.className === selectedClass
        )
      ) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: "orangered" },
            text: { color: "white" },
          },
        };
      } else if (validDays.has(currentDate.day())) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: Colors.primary },
            text: { color: "white" },
          },
        };
      } else {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: "#f0f0f0" },
            text: { color: "#d0d0d0" },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      }

      currentDate.add(1, "day");
    }

    // 🔥 Overlay TEMP selection (single only)
    if (tempDate) {
      availabilityData[tempDate] = {
        customStyles: {
          container: { backgroundColor: "orangered" },
          text: { color: "white" },
        },
      };
    }

    setMarkedDates(availabilityData);
  };

  const isTimeAtLeast3HoursLater = (date, time) => {
    if (!date || !time) return false;

    const now = moment();
    const selectedDateTime = moment(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm"
    );

    // If booking for a future date → allow
    if (selectedDateTime.isAfter(now, 'day')) {
      return true;
    }

    // Same day → check 3-hour difference
    const diffInHours = selectedDateTime.diff(now, 'hours', true);
    return diffInHours >= 3;
  };

  // Helper function to show alerts
  const showAlert = (title, message, type = 'info') => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress: () => console.log('Alert closed') }]
    );
  };

  // New function to check availability for all times and locations at once
  const checkAllSlotsAvailability = async (classId, date) => {
    try {
      console.log('🔍 CHECKING ALL SLOTS AVAILABILITY:');
      console.log("Class ID:", classId);
      console.log("Date:", date);

      // Extract all unique times and location IDs from class availability
      const allTimes = [...new Set(data.availability.map(item => item.time))];

      // Extract only location IDs (not the full objects)
      const allLocationIds = [...new Set(data.availability.flatMap(item =>
        item.locations.map(loc => typeof loc === 'object' ? loc._id : loc)
      ))];

      console.log("All Times:", allTimes);
      console.log("All Location IDs:", allLocationIds);

      const response = await axios.post(`${BaseUrl}preview-booking-class-availbality`, {
        classId: classId,
        date: date,
        times: allTimes,
        locationIds: allLocationIds  // Send only IDs, not objects
      });

      console.log('📊 ALL SLOTS AVAILABILITY RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ ERROR CHECKING ALL SLOTS AVAILABILITY:', error);
      return {
        slots: [],
        message: "Error checking availability"
      };
    }
  };

  // Function to get the start date - use createdAt from userPackage if available
  const getStartDate = () => {
    if (userPackage?.createdAt) {
      return moment(userPackage.createdAt).format("YYYY-MM-DD");
    }
    return moment().format("YYYY-MM-DD");
  };

  // Function to calculate the maximum date for calendar
  const getMaxDate = () => {
    if (extendedValidityEndDate) {
      return moment(extendedValidityEndDate).format("YYYY-MM-DD");
    } else {
      return moment(getStartDate()).add(packageDuration, "days").format("YYYY-MM-DD");
    }
  };

  // Function to check if a date is within validity period AND not in the past
  const isDateWithinValidity = (date) => {
    const checkDate = moment(date);
    const bookingStartDate = moment(getBookingStartDate()).startOf("day");
    const packageStartDate = moment(getStartDate()).startOf("day");

    // Check if date is before the booking start date (today or future package start)
    if (checkDate.isBefore(bookingStartDate)) {
      return false;
    }

    // Additional check: date should not be before package start date (safety check)
    if (checkDate.isBefore(packageStartDate)) {
      return false;
    }

    // Check if date is within the validity end date
    if (extendedValidityEndDate) {
      const extendedEnd = moment(extendedValidityEndDate).startOf("day");
      return checkDate.isSameOrAfter(packageStartDate) && checkDate.isSameOrBefore(extendedEnd);
    } else {
      const normalEnd = moment(getStartDate()).add(packageDuration, "days").startOf("day");
      return checkDate.isSameOrAfter(packageStartDate) && checkDate.isSameOrBefore(normalEnd);
    }
  };

  // Function to log the booking date range
  const logBookingDateRange = () => {
    const startDate = getStartDate();
    const maxDate = getMaxDate();

    console.log('📅 BOOKING DATE RANGE INFORMATION:');
    console.log('====================================');
    console.log('Package Name:', data?.name);
    console.log('Package Duration:', packageDuration, 'days');
    console.log('Total Sessions Available:', totalDays);
    console.log('Booking Start Date:', startDate);
    console.log('Booking End Date:', maxDate);
    console.log('Package Created At:', userPackage?.createdAt ? moment(userPackage.createdAt).format("YYYY-MM-DD") : 'Not available');

    if (extendedValidityEndDate) {
      console.log('📆 Extended Validity Applied');
      console.log('Extended End Date:', moment(extendedValidityEndDate).format("YYYY-MM-DD"));
    } else {
      console.log('📆 Normal Validity Period');
      console.log('Validity Period:', startDate, 'to', maxDate);
    }

    console.log('Available Days of Week:', data?.availability?.map(item => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[item.day];
    }));

    console.log('====================================');
  };

  useEffect(() => {
    if (!data) return;

    logBookingDateRange();

    const filter = selectedClasses?.filter((e) => e?.className == data?.name);
    setStoreData(filter);
    markCalendarDates(data?.availability, data?.name, filter);
  }, [data, userPackage, classFullDates]); // Add classFullDates here

  useEffect(() => {
    if (data) {
      logBookingDateRange();
    }
  }, [extendedValidityEndDate]);

  function generateRandomNumbers() {
    let randomNumbers = [];
    for (let i = 0; i < 10; i++) {
      randomNumbers.push(Math.floor(Math.random() * 100) + 1);
    }
    return randomNumbers.join();
  }

  const markCalendarDates = (availability, name, datass) => {
    const availabilityData = {};
    const startDate = moment(getStartDate()).startOf("day");
    const maxDate = getMaxDate();
    const validityTill = moment(maxDate);

    // Create a Set of valid days for O(1) lookup
    const validDays = new Set(availability?.map((item) => item?.day));

    let currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(validityTill)) {
      const dateString = currentDate.format("YYYY-MM-DD");
      const selectedClass = name || "No Class";

      // Check if date is within validity period
      if (isDateWithinValidity(dateString)) {
        if (validDays.has(currentDate.day())) {
          // Check if date is class full - check this FIRST
          if (classFullDates[dateString]) {
            availabilityData[dateString] = {
              customStyles: {
                container: {
                  backgroundColor: "pink",
                },
                text: {
                  color: "white",
                },
              },
              disabled: true,
              disableTouchEvent: true,
            };
          } else if (
            datass?.some(
              (entry) =>
                entry.date === moment(currentDate).format("YYYY-MM-DD") &&
                entry.className === selectedClass
            )
          ) {
            availabilityData[dateString] = {
              customStyles: {
                container: {
                  backgroundColor: "orangered",
                },
                text: {
                  color: "white",
                },
              },
            };
          } else {
            availabilityData[dateString] = {
              customStyles: {
                container: {
                  backgroundColor: Colors?.primary,
                },
                text: {
                  color: "white",
                },
              },
            };
          }
        } else {
          availabilityData[dateString] = {
            customStyles: {
              container: {
                backgroundColor: "#f0f0f0",
              },
              text: {
                color: "#d0d0d0",
              },
            },
            disabled: true,
            disableTouchEvent: true,
          };
        }
      } else {
        // Date is outside validity period (either before start or after end)
        availabilityData[dateString] = {
          customStyles: {
            container: {
              backgroundColor: "#f0f0f0",
            },
            text: {
              color: "#d0d0d0",
            },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      }

      currentDate.add(1, "day");
    }

    setMarkedDates(availabilityData);
  };

  const updateDisabledDates = () => {
    const disabledDates = {};

    storedata.forEach((entry) => {
      const matchClassDate = storedata.some(
        (item) => item.date === entry.date && item.className === entry.className
      );

      if (matchClassDate) {
        // currently no extra UI change needed
      }
    });

    setMarkedDates((prev) => ({
      ...prev,
      ...disabledDates,
    }));
  };

  const selectedDates = async (date) => {
    const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

    if (totalSelected >= totalDays) {
      showAlert(
        'Session Limit',
        `Only ${days} sessions available. Please save and proceed to book.`,
        'info'
      );
      return;
    }

    const checkDate = moment(date);
    const today = moment().startOf("day");
    const startDate = getStartDate();

    // Check if date is in the past
    if (checkDate.isBefore(today)) {
      showAlert(
        'Date Not Available',
        'Cannot book classes for past dates. Please select today or a future date.',
        'error'
      );
      return;
    }

    // Check if selected date is within validity period
    if (!isDateWithinValidity(date)) {
      if (checkDate.isBefore(moment(startDate))) {
        showAlert(
          'Date Not Available',
          `Cannot book classes before your package start date (${moment(startDate).format('DD MMM YYYY')})`,
          'error'
        );
      } else if (extendedValidityEndDate) {
        showAlert(
          'Date Not Available',
          `Please select a date between ${moment(startDate).format('DD MMM YYYY')} and ${moment(extendedValidityEndDate).format('DD MMM YYYY')}`,
          'error'
        );
      } else {
        showAlert(
          'Date Not Available',
          `Please select a date between ${moment(startDate).format('DD MMM YYYY')} and ${moment(getMaxDate()).format('DD MMM YYYY')}`,
          'error'
        );
      }
      return;
    }

    // Check if date is already marked as class full
    if (classFullDates[date]) {
      showAlert(
        'Class Full',
        'This class is full for the selected date. Please select another date.',
        'error'
      );
      return;
    }

    handleDateSelect(date);
  };

  const handleDateSelect = async (date) => {
    const selectedClass = data?.name || "No Class";

    if (
      storedata.some(
        (entry) => entry.date === date && entry.className === selectedClass
      )
    ) {
      showAlert(
        'Duplicate Selection',
        'This date is already selected for the same class!',
        'info'
      );
      return;
    }

    // First, set the loading state and temp selection for visual feedback
    setLoading(true);
    setTempSelectedDate(date);
    rebuildCalendarWithTempSelection(date);
    console.log('====================================');
    console.log("📅 DATE SELECTED:");
    console.log("Selected Date:", date);
    console.log("Class ID:", data?._id);
    console.log('====================================');

    setClassId(data?._id);

    // Call the new API to check all slots availability
    const availabilityResponse = await checkAllSlotsAvailability(data?._id, date);
    setLoading(false);

    if (availabilityResponse.slots && availabilityResponse.slots.length > 0) {
      console.log('🎯 PROCESSING AVAILABLE SLOTS:');

      // Filter only available slots
      const availableSlotsData = availabilityResponse.slots.filter(slot => slot.bookingAvailable);

      if (availableSlotsData.length === 0) {
        showAlert(
          'Class Full',
          'All slots for this date are fully booked. Please select another date.',
          'error'
        );

        // Mark this date as class full in the calendar IMMEDIATELY
        setClassFullDates(prev => ({
          ...prev,
          [date]: true
        }));

        // Update calendar to show pink color for class full date IMMEDIATELY
        markCalendarDates(data?.availability, data?.name, storedata);

        // RESET everything since it's class full
        setTempSelectedDate(null);
        rebuildCalendarWithTempSelection(null);
        setSelectedDate(null);
        setShowAvailability(null);
        setAvailableSlots([]);
        return;
      }

      console.log("Available Slots:", availableSlotsData);
      setAvailableSlots(availableSlotsData);

      // Only set selectedDate AFTER confirming there are available slots
      setSelectedDate(date);

      // Process the available slots to show in UI
      processAvailableSlotsData(availableSlotsData);
    } else {
      showAlert(
        'Availability Error',
        'No availability data received',
        'error'
      );
      // Reset everything on error too
      setTempSelectedDate(null);
      rebuildCalendarWithTempSelection(null);
      setSelectedDate(null);
      setShowAvailability(null);
      setAvailableSlots([]);
    }
  };

  const processAvailableSlotsData = (slotsData) => {
    // Create a mapping of location IDs to location names from the original class data
    const locationMap = {};
    data.availability.forEach(avail => {
      avail.locations.forEach(loc => {
        const locationId = typeof loc === 'object' ? loc._id : loc;
        const locationName = typeof loc === 'object' ? loc.name : `Location ${loc}`;
        locationMap[locationId] = locationName;
      });
    });

    // Group slots by time and their locations
    const slotsByTime = {};

    slotsData.forEach(slot => {
      if (!slotsByTime[slot.time]) {
        slotsByTime[slot.time] = [];
      }

      // Use the location map to get the location name
      const locationName = locationMap[slot.location] || `Location ${slot.location}`;

      slotsByTime[slot.time].push({
        _id: slot.location,
        name: locationName,
        key: slot.location,
        value: locationName
      });
    });

    // Convert to the format expected by the existing UI
    const formattedSlots = Object.keys(slotsByTime).map(time => ({
      time: time,
      locations: slotsByTime[time]
    }));

    console.log('🔄 FORMATTED SLOTS FOR UI:', formattedSlots);

    // Set the first available slot as selected by default
    if (formattedSlots.length > 0) {
      const firstSlot = formattedSlots[0];
      setSelectedTime(firstSlot.time);
      setSelectedLocation(firstSlot.locations[0]);
      setLocations(firstSlot.locations);
    }

    setShowAvailability({ slots: formattedSlots });
  };

  const handleTimeSelect = (time, location) => {
    if (!time || !location) return;

    // Find the slot data for the selected time
    const selectedSlotData = availableSlots.find(slot =>
      slot.time === time && slot.location === location[0]?._id
    );

    if (selectedSlotData && !selectedSlotData.bookingAvailable) {
      showAlert(
        'Slot Unavailable',
        'This slot is no longer available. Please select another time.',
        'error'
      );
      return;
    }

    const newData = location?.map((loc) => ({
      ...loc,
      key: loc?._id,
      value: loc?.name,
    }));
    setLocations(newData);
    setSelectedLocation(newData[0] || {});
    setSelectedTime(time);

    console.log('====================================');
    console.log("⏰ TIME SELECTED - ALL DATA:");
    console.log("Selected Date:", selectedDate);
    console.log("Class ID:", classid);
    console.log("Selected Time:", time);
    console.log("Available Locations:", newData.map(loc => ({ id: loc._id, name: loc.name })));
    console.log('====================================');
  };

  const handleLocationSelect = (location) => {
    // Check if the selected location-time combination is available
    const selectedSlot = availableSlots.find(slot =>
      slot.time === selectedTime && slot.location === location._id
    );

    if (selectedSlot && !selectedSlot.bookingAvailable) {
      showAlert(
        'Location Unavailable',
        'This location is no longer available for the selected time.',
        'error'
      );
      return;
    }

    setSelectedLocation(location);
    setMenuVisible(false);

    console.log('====================================');
    console.log("📍 LOCATION SELECTED - ALL DATA:");
    console.log("Selected Date:", selectedDate);
    console.log("Class ID:", classid);
    console.log("Selected Time:", selectedTime);
    console.log("Location ID:", location?._id);
    console.log("Location Name:", location?.name);
    console.log('====================================');
  };

  const handleContinue = async () => {
    const totalSelected = (selectedClasses?.length || 0) + (storedata?.length || 0);

    if (totalSelected >= totalDays) {
      showAlert(
        'Session Limit',
        `Only ${days} sessions available. Please save and proceed to book.`,
        'info'
      );
      return;
    }

    if (selectedDate && selectedTime && selectedLocation) {
      const selectedClass = data?.name || "No Class";

      const selectedDay = moment(selectedDate).day();

      const matchingAvailability = data.availability.find(item =>
        item.day === selectedDay && item.time === selectedTime
      );

      const duration = matchingAvailability?.duration || 60;

      setTempSelectedDate(null);
      rebuildCalendarWithTempSelection(null);


      // Double check availability from our stored available slots
      const slotAvailability = availableSlots.find(slot =>
        slot.time === selectedTime && slot.location === selectedLocation._id
      );

      if (!slotAvailability || !slotAvailability.bookingAvailable) {
        showAlert(
          'Slot Unavailable',
          'This slot is no longer available. Please select another time or location.',
          'error'
        );
        return;
      }
      if (!isTimeAtLeast3HoursLater(selectedDate, selectedTime)) {
        Alert.alert(
          "Booking Not Allowed",
          "You can book a class only at least 3 hours before the start time."
        );
        return;
      }


      const newEntry = {
        index: generateRandomNumbers(),
        classId: classid,
        className: data?.name,
        user: userId,
        dates: selectedDate,
        date: selectedDate,
        duration: duration,
        time: selectedTime,
        location: selectedLocation,
        amount: prices,
        people: 1,
      };

      if (
        storedata.some(
          (entry) =>
            entry.date === selectedDate && entry.className === selectedClass
        )
      ) {
        showAlert(
          'Duplicate Selection',
          'This date is already selected for the same class!',
          'info'
        );
        return;
      }

      // COMPREHENSIVE LOGGING - ALL 4 DATA POINTS TOGETHER
      console.log('====================================');
      console.log("✅ FINAL SELECTION - ALL 4 DATA POINTS:");
      console.log("1. Selected Date:", selectedDate);
      console.log("2. Class ID:", classid);
      console.log("3. Selected Time:", selectedTime);
      console.log("4. Location ID:", selectedLocation?._id);
      console.log("Additional Info:");
      console.log("   - Class Name:", data?.name);
      console.log("   - Location Name:", selectedLocation?.name);
      console.log("   - Duration:", duration, "minutes");
      console.log("   - Availability:", "Available - Class has space");
      console.log('====================================');

      setStoreData((prev) => [...prev, newEntry]);

      // Show success alert
      // showAlert(
      //   'Added to List',
      //   'Class has been added to your booking list',
      //   'success'
      // );

      markCalendarDates(data?.availability, data?.name, [...storedata, newEntry]);
      updateDisabledDates();
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedLocation(null);
      setAvailableSlots([]);
      setShowAvailability(null);
    }
  };

  const convertTo12HourFormat = (time) => {
    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  const getBookingStartDate = () => {
    // const today = moment().startOf("day");
    const packageStartDate = moment(getStartDate()).startOf("day");

    // If package start date is in future, use that, otherwise use today
    // if (packageStartDate.isAfter(today)) {
    return packageStartDate.format("YYYY-MM-DD");
    // }
    // return today.format("YYYY-MM-DD");
  };

  return (
    <>
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        <BookingSuccessModal isVisible={overviewModal} onClose={() => setOverviewModal(false)} />
        <TermsAndConditions
          modal={TNCModal}
          setModal={() => setTNCModal(false)}
          funcitonCall={() => startRazorpayPayment()}
        />

        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={[styles.classText, { flex: 1, flexShrink: 1, marginRight: 10 }]}
              numberOfLines={2}
            >
              {data?.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                padding: 10,
                borderRadius: 50,
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
                paddingHorizontal: 15,
              }}
              onPress={close}
            >
              <Text style={{ color: "white", fontSize: 20, marginTop: -5 }}>x</Text>
            </TouchableOpacity>
          </View>

          {/* Updated Date Range Info Display */}
          <View style={styles.dateRangeInfo}>
            <Text style={styles.dateRangeTitle}>Booking Period:</Text>
            <Text style={styles.dateRangeText}>
              {moment(getBookingStartDate()).format("DD MMM YYYY")} to {moment(getMaxDate()).format("DD MMM YYYY")}
            </Text>
            <Text style={styles.noteText}>
              {moment(getStartDate()).isAfter(moment())
                ? `(From your package start date until expiry)`
                : `(From your first class date until package expiry)`
              }
            </Text>
            {userPackage?.createdAt && (
              <Text style={styles.packageCreatedText}>
                Package starts from: {moment(userPackage.createdAt).format("DD MMM YYYY")}
              </Text>
            )}
            {extendedValidityEndDate && (
              <Text style={styles.extendedText}>(Extended Validity Applied)</Text>
            )}
          </View>

          <Calendar
            style={styles.calendar}
            markedDates={markedDates}
            minDate={getBookingStartDate()} // Use the new function here
            markingType={"custom"}
            maxDate={getMaxDate()}
            hideExtraDays={true}
            onDayPress={(day) => selectedDates(day?.dateString)}
          />

          <View style={{ display: "flex", flexDirection: "row", gap: 10, flexWrap: 'wrap' }}>
            {[
              { name: "Available", color: Colors?.primary },
              { name: "Selected", color: "orangered" },
              { name: "Class Full", color: "pink" },
              { name: "Not Available", color: "lightgray" },
            ]?.map((e) => (
              <View style={{ display: "flex", flexDirection: "row", gap: 5, alignItems: 'center' }} key={e.name}>
                <View style={{ height: 20, width: 20, borderRadius: 50, backgroundColor: e?.color }} />
                <Text style={{ color: "black", fontSize: 12 }}>{e?.name}</Text>
              </View>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
          ) : (
            selectedDate &&
            showAvailabilitys && (
              <>
                <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>

                <View style={styles.timeContainer}>
                  {showAvailabilitys?.slots?.map((slot, idx) => {
                    const isAllowed = isTimeAtLeast3HoursLater(selectedDate, slot.time);

                    return (
                      <Button
                        key={idx}
                        mode={selectedTime === slot.time ? "contained" : "outlined"}
                        onPress={() => handleTimeSelect(slot.time, slot.locations)}
                        disabled={!isAllowed}
                        style={styles.timeButton}
                        labelStyle={{ fontSize: 14 }}
                      >
                        {convertTo12HourFormat(slot.time)}
                      </Button>
                    );
                  })}

                </View>

                <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                  {selectedLocation?.value ?? "Select Location"}
                </Button>

                {menuVisible && (
                  <View
                    style={{
                      elevation: 3,
                      backgroundColor: "white",
                      borderRadius: 10,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: "lightgray",
                    }}
                  >
                    {locations.map((location, i) => (
                      <TouchableOpacity
                        key={location.key}
                        onPress={() => handleLocationSelect(location)}
                        style={{
                          padding: 10,
                          width: "90%",
                          alignSelf: "center",
                          borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
                          borderColor: "lightgray",
                        }}
                      >
                        <Text style={{ color: "black" }}>
                          {selectedLocation?.key === location.key ? `✓ ${location.value}` : location.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text></Text>
                <Button
                  mode="contained"
                  onPress={handleContinue}
                  style={{
                    backgroundColor: Colors.primary,
                    width: "40%",
                    alignSelf: "center",
                    borderRadius: 10,
                  }}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Add to List"}
                </Button>
              </>
            )
          )}

          <View style={{ padding: 20 }}>
            {storedata.map((entry, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 15,
                  padding: 12,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <Text style={[styles.selectedTitle, { marginBottom: 4 }]}>{entry?.className}</Text>
                <Text style={styles.selectedDate}>📅 {moment(entry?.date).format("MMM DD, YYYY")}</Text>
                <Text style={styles.selectedTime}>⏰ {convertTo12HourFormat(entry?.time)}</Text>
                <Text style={styles.selectedLocation}>📍 Location: {entry?.location?.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "white",
            padding: 10,
            flexDirection: "row",
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <Button
            mode="contained"
            onPress={() => {
              if (!storedata || storedata.length === 0) {
                showAlert(
                  'No Bookings',
                  'Please add at least one booking before saving',
                  'error'
                );
                return;
              }
              saveData(storedata);
              close();
            }}
            style={{
              borderRadius: 10,
              paddingVertical: 3,
              backgroundColor: Colors.primary,
            }}
          >
            {processingPayment ? "Processing..." : "SAVE"}
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    position: "relative",
    marginBottom: 30,
  },
  detailsContainer: {
    marginVertical: 60,
    marginHorizontal: 20,
    position: "relative",
    width: "90%",
  },
  calendar: {
    marginVertical: 20,
  },
  loader: {
    marginVertical: 10,
  },
  classText: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: "500",
    marginLeft: 10,
  },
  dateText: {
    color: "black",
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  availableText: {
    color: Colors.primary,
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  timeButton: {
    margin: 5,
    paddingHorizontal: 16,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  selectedTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
    flexWrap: "wrap",
  },
  selectedDate: {
    color: "#333",
    fontSize: 14,
    marginBottom: 2,
  },
  selectedTime: {
    color: "#333",
    fontSize: 14,
    marginBottom: 2,
  },
  selectedLocation: {
    color: "#333",
    fontSize: 14,
  },
  divider: {
    marginVertical: 10,
  },
  selectedClassInfo: {
    marginTop: 10,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  dateRangeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  dateRangeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  packageCreatedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  extendedText: {
    fontSize: 12,
    color: '#28a745',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default BookingPackageModal;