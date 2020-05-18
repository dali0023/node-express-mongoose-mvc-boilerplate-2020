const passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");
const User = require("../../models/admin/UserModel");

const dashboard = (req, res, next) => {
  res.render("./admin/dashboard");
};
const login = (req, res, next) => {
  res.render("./admin/auth/login");
};

// Logout
const logout = (req, res, next) => {
  req.logOut();

  req.flash("success_msg", "You have been logged out.");
  res.redirect("/admin/login");
};

// login check
const checkUser = passport.authenticate("local", {
  successRedirect: "/admin/dashboard",
  failureRedirect: "/admin/login",
  failureFlash: "Invalid email or password. Try Again!!!",
});
const signUp = (req, res, next) => {
  res.render("./admin/auth/signUp");
};

// Save User
const saveUser = (req, res, next) => {
  let { name, email, password } = req.body;

  let userData = {
    name: name,
    email: email,
  };

  User.register(userData, password, (err, user) => {
    if (err) {
      req.flash("error_msg", "ERROR: " + err);
      res.redirect("/admin/signup");
    }
    passport.authenticate("local")(req, res, () => {
      req.flash("success_msg", "Account created successfully");
      res.redirect("/admin/login");
    });
  });
};
const changePassword = (req, res, next) => {
  res.render("./admin/auth/changePassword");
};
const saveChangePassword = (req, res, next) => {
  if (req.body.password !== req.body.confirmpassword) {
    req.flash("error_msg", "Password don't match. Type again!");
    return res.redirect("/password/change");
  }

  User.findOne({ email: req.user.email }).then((user) => {
    user.setPassword(req.body.password, (err) => {
      user
        .save()
        .then((user) => {
          req.flash("success_msg", "Password changed successfully.");
          res.redirect("/admin/dashboard");
        })
        .catch((err) => {
          req.flash("error_msg", "ERROR: " + err);
          res.redirect("/password/change");
        });
    });
  });
};

// reset password...
const resetPassword = (req, res, next) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash(
          "error_msg",
          "Password reset token in invalid or has been expired."
        );
        res.redirect("/admin/forgot-password");
      }
      res.render("./admin/auth/newPassword", { token: req.params.token });
    })
    .catch((err) => {
      req.flash("error_msg", "ERROR: " + err);
      res.redirect("/admin/forgot-password");
    });
};

const saveResetPassword = (req, res, next) => {
  async.waterfall(
    [
      (done) => {
        User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() },
        })
          .then((user) => {
            if (!user) {
              req.flash(
                "error_msg",
                "Password reset token in invalid or has been expired."
              );
              res.redirect("/admin/forgot-password");
            }

            if (req.body.password !== req.body.confirmpassword) {
              req.flash("error_msg", "Password don't match.");
              return res.redirect("/admin/forgot-password");
            }

            user.setPassword(req.body.password, (err) => {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save((err) => {
                req.logIn(user, (err) => {
                  done(err, user);
                });
              });
            });
          })
          .catch((err) => {
            req.flash("error_msg", "ERROR: " + err);
            res.redirect("/admin/forgot-password");
          });
      },
      (user) => {
        let smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        let mailOptions = {
          to: user.email,
          from: "Nazmul Hasan project2734@gmail.com",
          subject: "Your password is changed",
          text:
            "Hello, " +
            user.name +
            "\n\n" +
            "This is the confirmation that the password for your account " +
            user.email +
            " has been changed.",
        };

        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash(
            "success_msg",
            "Your password has been changed successfully."
          );
          res.redirect("/admin/login");
        });
      },
    ],
    (err) => {
      res.redirect("/admin/login");
    }
  );
};

// Forgot Password...
const forgotPassword = (req, res, next) => {
  res.render("./admin/auth/forgotPassword");
};
const recoverPassword = (req, res, next) => {
  let recoveryPassword = "";
  async.waterfall(
    [
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString("hex");
          done(err, token);
        });
      },
      (token, done) => {
        User.findOne({ email: req.body.email })
          .then((user) => {
            if (!user) {
              req.flash("error_msg", "User does not exist with this email.");
              return res.redirect("/admin/forgot-password");
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 1800000; //   1/2 hours

            user.save((err) => {
              done(err, token, user);
            });
          })
          .catch((err) => {
            req.flash("error_msg", "ERROR: " + err);
            res.redirect("/admin/forgot-password");
          });
      },
      (token, user) => {
        let smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        let mailOptions = {
          to: user.email,
          from: "Nazmul Hasan project2734@gmail.com",
          subject: "Recovery Email from Auth Project",
          text:
            "Please click the following link to recover your passoword: \n\n" +
            "http://" +
            req.headers.host +
            "/admin/password/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email.",
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash(
            "success_msg",
            "Email send with further instructions. Please check that."
          );
          res.redirect("/admin/forgot-password");
        });
      },
    ],
    (err) => {
      if (err) res.redirect("/admin/forgot-password");
    }
  );
};

module.exports = {
  dashboard,
  login,
  signUp,
  resetPassword,
  changePassword,
  saveChangePassword,
  forgotPassword,
  saveUser,
  checkUser,
  logout,
  recoverPassword,
  saveResetPassword,
};
