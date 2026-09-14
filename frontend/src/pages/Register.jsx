import { useState } from "react";
import {
  CalendarDays,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Phone,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import PartnerCredentialsModal from "../components/auth/PartnerCredentialsModal";

export default function Register() {
  const { user, register: createAccount } = useAuth();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  // Modal State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerCredentials, setPartnerCredentials] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  if (user) return <Navigate to="/" replace />;

  const submit = async (values) => {
    setBusy(true);

    try {
      const data = await createAccount(values);

      toast.success("Couple account created successfully 💖");

      // Open Success Modal
      setPartnerCredentials(data.partner);
      setShowPartnerModal(true);
    } catch (error) {
      toast.error(
        error.response?.status === 409
          ? "This mobile number is already registered."
          : error.response?.data?.message ||
          "Could not create your couple account."
      );
    } finally {
      setBusy(false);
    }
  };

  const field = (name, label, options = {}) => (
    <label>
      {label}
      <input
        {...register(name, options)}
        placeholder={options.placeholder}
      />
      {errors[name] && (
        <small className="field-error">{errors[name].message}</small>
      )}
    </label>
  );

  return (
    <>
      <div className="auth-page">
        <div className="auth-decoration pink-orb" />
        <div className="auth-decoration purple-orb" />

        <div className="auth-panel auth-panel-wide">
          <Logo />

          <div className="auth-copy">
            <span className="eyebrow">Create your shared universe</span>

            <h1>Two hearts, one little kingdom.</h1>

            <p>
              Set up your private PrincessVerse and invite your favorite person.
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="auth-form">
            <div className="form-section-title">Your details</div>

            {field("name", "Full Name", {
              required: "Full name is required",
              placeholder: "Shivang Sharma",
            })}

            <label>
              Mobile Number

              <div className="input-wrap">
                <Phone size={17} />

                <input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit Indian mobile number"
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10 digit Indian mobile number",
                    },
                  })}
                />
              </div>

              {errors.mobileNumber && (
                <small className="field-error">
                  {errors.mobileNumber.message}
                </small>
              )}
            </label>

            <label>
              Password

              <div className="input-wrap">
                <LockKeyhole size={17} />

                <input
                  type={visible ? "text" : "password"}
                  placeholder="8+ chars, uppercase, number, special character"
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                      message:
                        "Use 8+ chars with uppercase, number and special character",
                    },
                  })}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.password && (
                <small className="field-error">
                  {errors.password.message}
                </small>
              )}
            </label>

            <label>
              Confirm Password

              <input
                type="password"
                placeholder="Repeat your password"
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />

              {errors.confirmPassword && (
                <small className="field-error">
                  {errors.confirmPassword.message}
                </small>
              )}
            </label>

            <div className="form-section-title">Your Partner</div>

            {field("partnerName", "Partner Name", {
              required: "Partner name is required",
              placeholder: "Khushi",
            })}

            <label>
              Partner Mobile Number

              <div className="input-wrap">
                <Phone size={17} />

                <input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit Indian mobile number"
                  {...register("partnerMobileNumber", {
                    required: "Partner mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10 digit Indian mobile number",
                    },
                    validate: (value) =>
                      value !== watch("mobileNumber") ||
                      "Mobile numbers must be different",
                  })}
                />
              </div>

              {errors.partnerMobileNumber && (
                <small className="field-error">
                  {errors.partnerMobileNumber.message}
                </small>
              )}
            </label>

            {field("relationshipName", "Relationship Name", {
              required: "Relationship name is required",
              placeholder: "Bubu ❤️ Dudu",
            })}

            <label>
              Anniversary Date

              <div className="input-wrap">
                <CalendarDays size={17} />

                <input
                  type="date"
                  {...register("anniversaryDate")}
                />
              </div>
            </label>

            <button className="primary-button full" disabled={busy}>
              {busy ? "Creating your universe..." : "Create Couple Account"}

              <Heart size={16} />
            </button>
          </form>

          <p className="auth-footer">
            Already have a kingdom?{" "}
            <Link to="/admin-login">Sign in as Admin</Link>
          </p>
        </div>
      </div>

      {/* Success Popup */}
      <PartnerCredentialsModal
        open={showPartnerModal}
        partner={partnerCredentials}
        onClose={() => {
          setShowPartnerModal(false);
          navigate("/admin/dashboard");
        }}
      />
    </>
  );
}