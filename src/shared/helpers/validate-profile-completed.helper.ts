import { object, string, boolean, array } from 'yup';

const ProfileSchema = {
  firstName: string().required('firstName'),
  lastName: string().required('lastName'),
  phoneNumber: string().required('phoneNumber'),
  isAvailableForChange: string().required('isAvailableForChange'),
  isUniversityStudent: boolean().required('isUniversityStudent'),
  city: string().required('city'),
  academicBackgrounds: array().required('academicBackgrounds'),
};

const AboutSchema = {
  resume: string().required('resume'),
  internshipModel: array().required('internshipModel'),
  humanRace: string().required('humanRace'),
  sexualOrientation: string().required('sexualOrientation'),
  pcd: string().required('pcd'),
  livingPlace: string().required('livingPlace'),
  whereStudiedHighSchool: string().required('whereStudiedHighSchool'),
  familyIncome: string().required('familyIncome'),
  studentship: string().required('studentship'),
};

export const validateProfileHasCompleted = async (profile) => {
  try {
    const [profileSchema, aboutSchema] = [
      object(ProfileSchema),
      object(AboutSchema),
    ];

    await profileSchema.validate(profile);
    await aboutSchema.validate(profile.about);

    return {
      hasCompletedProfile: true,
    };
  } catch (error) {
    return {
      hasCompletedProfile: false,
      att: error.message,
    };
  }
};
