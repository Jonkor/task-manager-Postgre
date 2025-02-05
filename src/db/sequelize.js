const { Sequelize, Model, DataTypes  } = require('sequelize');
const validator = require('validator');

// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')

const sequelize = new Sequelize('taskmanagerapi', 'postgres', 'basededatos', {
    host: 'localhost',
    dialect: 'postgres' 
  });

//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }


sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

const User = sequelize.define(
   'user',
   {
     // Model attributes are defined here
     id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
     },
     name: {
       type: DataTypes.TEXT,
       allowNull: false
     },
     email: {
       type: DataTypes.STRING,
       allowNull: false,
       validate:{
        isEmail: true,
       }
     },
     age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isPositive(value){
          if(value < 0){
            throw new Error('Age must be a positive number');
          }    
        }
      }
     },
     password: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isGreaterThan(value){
          if(value.length < 7){
            throw new Error('Password must be greater than 6 characters');
          }
        },

        notPassword(value){
          if(value.toLowerCase().includes('password')){
            throw new Error('Password cannont contain password');
          }
        }
      }
     }
   },
   {
     // Other model options go here
   },
 );

 const Task = sequelize.define(
  'task',
  {
    // Model attributes are defined here
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    // Other model options go here
  },
);

 (async () => {
  await sequelize.sync({force: true});
  // Code here
  const user = await User.create({ name: 'Laura', email: 'JOHN@dsds.com', age: 26, password: 'dskji23jkj' });

  const task = await Task.create({ description: 'hoola', completed: true });
  // Jane exists in the database now!
  console.log(user instanceof User); // true
})();
 
