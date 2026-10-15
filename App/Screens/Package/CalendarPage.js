import React, {useState} from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';

const CalendarPage = () => {
  const [selected, setSelected] = useState('');

  return (
    <Calendar
      onDayPress={day => {
        setSelected(day.dateString);
      }}
      markedDates={{
        [selected]: {
          selected: true,
          disableTouchEvent: true,
          selectedDotColor: 'orange',
        },
      }}
    />
  );
};

export default CalendarPage;
