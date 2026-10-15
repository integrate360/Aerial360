import aerialsilks from '../../assets/aerial-silks.jpg';
import aerialhoop from '../../assets/aerial-hoop.jpg';
import aerialslings from '../../assets/aerial-silks.jpg';
import trapeze from '../../assets/trapeze.jpg';
import flyingpole from '../../assets/flying-pole.jpg';
import rope from '../../assets/rope.jpg';
import straps from '../../assets/straps.jpg';
import spiral from '../../assets/spiral.jpg';
import cube from '../../assets/cube.jpg';

export const StaticCategoryData = [
  {
    _id: '001',
    title: 'Aerial Arts',
    description:
      'Aerial arts is a form of performance art and fitness that involves acrobatic movements performed on specialized apparatuses suspended in the air. It combines elements of dance, gymnastics, and circus arts, building strength, flexibility, and coordination. Aerial arts can be practiced for performance, fitness, or artistic expression and are often featured in circus shows, dance performances, and contemporary theater productions. ',
    image:
      'https://res.cloudinary.com/dujunrfjh/image/upload/v1736243908/airbound/vkqxueolz0tpwllzat7t.jpg',
    offerPrice: '1500',
    price: 1200,
    createdAt: '2025-01-07T18:46:55.297Z',
    updatedAt: '2025-01-10T09:29:18.636Z',
    classes: [
      {
        _id: 'class_002',
        name: 'Aerial Silks',
        description: `Aerial Silks are long, flowing fabrics suspended from a single or double point, used for breathtaking performances that combine strength, flexibility, and artistry. Dancers climb, wrap, and suspend themselves in the silks, creating stunning drops, spins, and poses high above the ground. 
This apparatus challenges core and upper body strength while enhancing grace and fluidity. Aerial silks are popular for their dramatic visual appeal and the sense of freedom they provide, making them a favorite in both performance art and aerial fitness.`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana, Masuma Mun',
                image: [aerialsilks],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_001',
        name: 'Aerial Hoop',
        description: ` a circular steel apparatus suspended in the air, offering a captivating platform for acrobatic and dance movements. Performers use the hoop to create dynamic spins, elegant poses, and gravity-defying transitions
The apparatus can be rigged to spin or remain stationary, allowing for versatility in routines. Aerial hoop is excellent for building strength, flexibility, and endurance, while its timeless appeal makes it a favorite in both performances and fitness training.`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana, Masuma Mun',
                image: [aerialhoop],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_003',
        name: 'Aerial Slings',
        description: `Slings, or hammocks, are looped fabric suspended from a single or double point, used for dynamic drops, flowing transitions, and striking poses. They are also popular for their therapeutic and fitness
benefits, helping to improve flexibility, core strength, and body awareness.
They improve flexibility, core strength, and body awareness while serving as a foundational apparatus, helping beginners build skills applicable to all equipment.`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana, Masuma Mun',
                image: [aerialslings],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_004',
        name: 'Trapeze',
        description: `Trapeze is a versatile aerial apparatus consisting of a horizontal bar suspended by two ropes, allowing for fluid movements, spins, and dynamic transitions. Unlike traditional trapeze, it is often rigged to allow more freedom of motion, combining elements of aerial arts with contemporary dance.
Performers use the bar and ropes to execute graceful poses, powerful tricks, and flowing sequences, showcasing strength, flexibility, and artistry. Dance trapeze is ideal for storytelling and expressive choreography, blending elegance with athleticism.`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Masuma Mun',
                image: [trapeze],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_006',
        name: 'Flying Pole',
        description: `Flying Pole`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana, Masuma Mun',
                image: [flyingpole],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_005',
        name: 'Rope',
        description: `Rope (Corde Lisse)`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana',
                image: [rope],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_007',
        name: 'Straps',
        description: `Straps`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj, Deanne Rana, Masuma Mun',
                image: [straps],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_008',
        name: 'Spiral',
        description: `Spiral`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Ria Bajaj',
                image: [spiral],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },

      {
        _id: 'class_009',
        name: 'Cube',
        description: `Cube`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Deanne Rana, Masuma Mun',
                image: [cube],
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },
    ],
  },
  {
    _id: '002',
    title: 'Pole Dance and Fitness',
    description:
      'Pole Dance & Fitness is a dynamic art form and full-body workout that combines elements of dance, acrobatics, and strength training using a vertical pole as the primary apparatus. Both forms require significant core strength, coordination, and body awareness, making pole an empowering discipline for practitioners of all levels.',
    image:
      'https://res.cloudinary.com/dujunrfjh/image/upload/v1736243962/airbound/zfuq4klyltpgrkf5pu3b.jpg',
    offerPrice: '1800',
    price: 1600,
    createdAt: '2025-01-07T19:00:00.297Z',
    updatedAt: '2025-01-10T10:00:18.636Z',
    classes: [
      {
        _id: 'class_002',
        name: 'Pole Dance',
        description: `is a performance-based discipline that blends fluid movement, spins, tricks, and transitions, often incorporating artistic expression, musicality, and storytelling. It can range from sensual and exotic styles to contemporary and theatrical performances.`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Simran Kaur',
                image:
                  'https://res.cloudinary.com/demo/image/upload/v1735641390/stretching/trainer5.jpg',
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },
      {
        _id: 'class_003',
        name: 'Pole Fitness',
        description: `focuses on building strength, endurance, and flexibility through conditioning exercises, static holds, climbs, and inversions. It is a recognized form of athletic training and is practiced as a sport worldwide.
`,
        price: 1200,
        offerPrice: 1500,
        availability: [
          {
            _id: '6780e86e66d60c9a83b370dc',
            day: 6,
            duration: 60,
            time: '10:00',
            maxPeople: 5,
            locations: [
              {
                _id: '676e6030b5eda6eac0ec4887',
                name: 'Khar',
                address:
                  '2nd Floor, Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052',
                googleMapLink: 'https://maps.app.goo.gl/Fio1YycYcCQN5hiN7',
              },
            ],
            trainers: [
              {
                _id: '6785j8k6a75e6d2fb4aca18f',
                name: 'Simran Kaur',
                image:
                  'https://res.cloudinary.com/demo/image/upload/v1735641390/stretching/trainer5.jpg',
                description: 'Flexibility & Mobility Coach',
              },
            ],
          },
        ],
        category: {
          _id: 'cat_001',
          name: 'Aerial Yoga',
        },
        image: [
          'https://example.com/morning-aerial1.jpg',
          'https://example.com/morning-aerial2.jpg',
        ],
      },
    ],
  },
  {
    _id: '003',
    title: 'Strength Training',
    description: `Our customized strength training programs help aerialists and pole athletes build strength, balance, and endurance while reducing injury risks. Designed to target muscle imbalances and functional strength, these plans focus on:

✅ Upper body & grip strength – for powerful holds and transitions

✅ Core stability – to maintain control in the air

✅ Lower body engagement – to support lifts and landings

✅ Injury prevention – by strengthening stabilizers and improving mobility

Each program is tailored to your level and goals, incorporating progressive overload, flexibility work, corrective exercises, and endurance drills. Whether you're building a foundation or refining technique, our plans help you train smarter, move stronger, and fly higher! 
`,
    image: 'strength',

    offerPrice: '1400',
    price: 1200,
    createdAt: '2025-01-07T19:15:30.297Z',
    updatedAt: '2025-01-10T10:20:18.636Z',
    classes: [
      // {
      //   _id: 'class_003',
      //   name: 'Evening Pilates',
      //   description: 'Improve posture and flexibility with evening Pilates.',
      //   price: 1200,
      //   offerPrice: 1400,
      //   availability: [
      //     {
      //       _id: '6780e86e66d60c9a83b3710a',
      //       day: 2,
      //       duration: 60,
      //       time: '19:00',
      //       maxPeople: 6,
      //       locations: [
      //         {
      //           _id: '676e6030b5eda6eac0ec4891',
      //           name: 'Andheri',
      //           address:
      //             '5th Floor, Sunrise Tower, Andheri East, Mumbai, Maharashtra 400093',
      //           googleMapLink: 'https://maps.app.goo.gl/exampleAndheri',
      //         },
      //       ],
      //       trainers: [
      //         {
      //           _id: '6785j8k6a75e6d2fb4aca18f',
      //           name: 'Simran Kaur',
      //           image:
      //             'https://res.cloudinary.com/demo/image/upload/v1735641390/stretching/trainer5.jpg',
      //           description: 'Flexibility & Mobility Coach',
      //         },
      //       ],
      //     },
      //   ],
      //   category: {
      //     _id: 'cat_003',
      //     name: 'Pilates',
      //   },
      //   image: [
      //     'https://example.com/pilates1.jpg',
      //     'https://example.com/pilates2.jpg',
      //   ],
      // },
    ],
  },
  {
    _id: '004',
    title: 'Reformer Pilates',
    description: `Reformer Pilates is a full-body workout using a spring-loaded machine (the reformer) to build core strength, flexibility, and muscular balance. It enhances control, stability, and posture through resistance-based movements, making it ideal for rehabilitation, strength training, and injury prevention.
`,
    image: 'pilats',

    offerPrice: '2000',
    price: 1800,
    createdAt: '2025-01-07T19:30:45.297Z',
    updatedAt: '2025-01-10T10:40:18.636Z',
    classes: [],
  },
  {
    _id: '005',
    title: 'Kids Aerial Arts',
    description:
      'Kids Aerial Arts is a fun and engaging discipline that combines strength, flexibility, and creativity through apparatuses like aerial silks, aerial hoop (lyra), and pole sport. Designed specifically for young learners, it helps develop coordination, confidence, and body awareness in a safe and supportive environment. Kids build grip strength, balance, and endurance while exploring dynamic movements in the air.',
    image:
      'https://res.cloudinary.com/dujunrfjh/image/upload/v1736244260/airbound/osqofe5rnca4yy2f6rte.jpg',

    offerPrice: '1200',
    price: 1000,
    createdAt: '2025-01-07T19:45:10.297Z',
    updatedAt: '2025-01-10T11:00:18.636Z',
    classes: [],
  },
];