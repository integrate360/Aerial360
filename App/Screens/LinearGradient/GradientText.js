import React from 'react';
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const GradientText = ({text}) => {
  // Define default values for other properties
  const fontSize = 24; // Default font size
  const x1 = '0%'; // Default gradient start x-coordinate
  const y1 = '0%'; // Default gradient start y-coordinate
  const x2 = '100%'; // Default gradient end x-coordinate
  const y2 = '0%'; // Default gradient end y-coordinate
  const colors = [
    // Default gradient colors
    {color: '#FF6F61', opacity: 1},
    {color: '#FFB347', opacity: 1},
  ];

  return (
    <Svg height={fontSize * 1.5} width="100%">
      <Defs>
        <LinearGradient id="grad" x1={x1} y1={y1} x2={x2} y2={y2}>
          {colors.map((color, index) => (
            <Stop
              key={index}
              offset={`${(index / (colors.length - 1)) * 100}%`}
              stopColor={color.color}
              stopOpacity={color.opacity || 1}
            />
          ))}
        </LinearGradient>
      </Defs>
      <SvgText
        fill="url(#grad)"
        fontSize={fontSize}
        fontWeight="bold"
        x="0"
        y={fontSize}>
        {text}
      </SvgText>
    </Svg>
  );
};

export default GradientText;
