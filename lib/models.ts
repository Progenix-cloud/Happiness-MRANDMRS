import mongoose, { Schema, Document, Model } from 'mongoose'

// User Interface
export interface IUser extends Document {
  email: string
  name: string
  phone?: string
  password: string
  roles: string[]
  category?: string
  registrationStatus: 'pending' | 'approved' | 'rejected'
  happinessPassportCount: number
  verifiedEntriesCount: number
  profileImage?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

// OTP Interface
export interface IOTP extends Document {
  email: string
  otp: string
  expiresAt: Date
  used: boolean
  type: 'email_verification' | 'password_reset'
  createdAt: Date
}

// Payment Interface
export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// HappinessEntry Interface
export interface IHappinessEntry extends Document {
  userId: mongoose.Types.ObjectId
  date: Date
  entry: string
  mediaUrls: string[]
  verified: boolean
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

// Media Interface
export interface IMedia extends Document {
  userId: mongoose.Types.ObjectId
  type: 'photo' | 'video'
  url: string
  key?: string // S3 key
  provider: 's3' | 'cloudinary'
  caption?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Registration Interface
export interface IRegistration extends Document {
  userId: mongoose.Types.ObjectId
  category: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  formData: {
    dateOfBirth?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    shortBio?: string
    whyParticipate?: string
    instagramHandle?: string
    facebookHandle?: string
  }
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Vote/Like Interface
export interface IVote extends Document {
  userId: mongoose.Types.ObjectId
  resourceType: 'contestant' | 'entry'
  resourceId: string
  createdAt: Date
}

// View/Analytics Interface
export interface IView extends Document {
  resourceType: 'contestant' | 'profile'
  resourceId: string
  userId?: mongoose.Types.ObjectId
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// User Schema
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  roles: { type: [String], default: ['participant'] },
  category: { type: String },
  registrationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  happinessPassportCount: { type: Number, default: 0 },
  verifiedEntriesCount: { type: Number, default: 0 },
  profileImage: { type: String },
  bio: { type: String },
}, { timestamps: true })

// OTP Schema
const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  type: { type: String, enum: ['email_verification', 'password_reset'], required: true },
}, { timestamps: true })

// Payment Schema
const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  verifiedAt: { type: Date },
}, { timestamps: true })

// HappinessEntry Schema
const HappinessEntrySchema = new Schema<IHappinessEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  entry: { type: String, required: true },
  mediaUrls: { type: [String], default: [] },
  verified: { type: Boolean, default: false },
  adminNotes: { type: String },
}, { timestamps: true })

// Media Schema
const MediaSchema = new Schema<IMedia>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['photo', 'video'], required: true },
  url: { type: String, required: true },
  key: { type: String },
  provider: { type: String, enum: ['s3', 'cloudinary'], default: 's3' },
  caption: { type: String },
  verified: { type: Boolean, default: false },
}, { timestamps: true })

// Registration Schema
const RegistrationSchema = new Schema<IRegistration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
  formData: {
    dateOfBirth: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    shortBio: { type: String },
    whyParticipate: { type: String },
    instagramHandle: { type: String },
    facebookHandle: { type: String },
  },
  submittedAt: { type: Date },
}, { timestamps: true })

// Vote Schema
const VoteSchema = new Schema<IVote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { type: String, enum: ['contestant', 'entry'], required: true },
  resourceId: { type: String, required: true },
}, { timestamps: true })

// View Schema
const ViewSchema = new Schema<IView>({
  resourceType: { type: String, enum: ['contestant', 'profile'], required: true },
  resourceId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true })

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ category: 1 })
UserSchema.index({ registrationStatus: 1 })
OTPSchema.index({ email: 1, otp: 1 })
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
PaymentSchema.index({ razorpayOrderId: 1 })
PaymentSchema.index({ razorpayPaymentId: 1 })
PaymentSchema.index({ userId: 1 })
HappinessEntrySchema.index({ userId: 1 })
HappinessEntrySchema.index({ date: 1 })
HappinessEntrySchema.index({ verified: 1 })
MediaSchema.index({ userId: 1 })
MediaSchema.index({ verified: 1 })
RegistrationSchema.index({ userId: 1 })
RegistrationSchema.index({ status: 1 })
VoteSchema.index({ userId: 1, resourceType: 1, resourceId: 1 }, { unique: true })
VoteSchema.index({ resourceType: 1, resourceId: 1 })
ViewSchema.index({ resourceType: 1, resourceId: 1 })
ViewSchema.index({ createdAt: -1 })

// Models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
export const HappinessEntry: Model<IHappinessEntry> = mongoose.models.HappinessEntry || mongoose.model<IHappinessEntry>('HappinessEntry', HappinessEntrySchema)
export const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)
export const Registration: Model<IRegistration> = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema)
export const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema)
export const View: Model<IView> = mongoose.models.View || mongoose.model<IView>('View', ViewSchema)

