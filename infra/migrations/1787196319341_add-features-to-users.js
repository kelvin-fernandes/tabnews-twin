exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    features: {
      type: "varchar[]",
      default: "{}",
      notNull: true,
    },
  });
};

exports.down = () => false;
