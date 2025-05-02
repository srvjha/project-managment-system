import { z } from "zod";
import { UserRolesEnum } from "../utils/constants";

const createProjectSchema = z.object({
  name: z.string().trim().nonempty("Project name is required"),
  description: z.string().trim().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const addProjectMemberSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  role: z
    .enum([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER], {
      message: "Role must be either 'project_admin' or 'member'",
    })
    .optional(),
});

const memberRoleValidation = addProjectMemberSchema.pick({ role: true });

// types
type ProjectData = z.infer<typeof createProjectSchema>;
type UdpateProjectData = z.infer<typeof updateProjectSchema>;
type ProjectMemberData = z.infer<typeof addProjectMemberSchema>;
type UpdateMemberRole = z.infer<typeof memberRoleValidation>;

const validateCreateProjectData = (data: ProjectData) => {
  return createProjectSchema.safeParse(data);
};

const validateUpdateProjectData = (data: UdpateProjectData) => {
  return updateProjectSchema.safeParse(data);
};

const validateAddProjectMemberData = (data: ProjectMemberData) => {
  return addProjectMemberSchema.safeParse(data);
};

const validateUpdateMemberData = (data: UpdateMemberRole) => {
  return memberRoleValidation.safeParse(data);
};

export {
  validateCreateProjectData,
  validateUpdateProjectData,
  validateAddProjectMemberData,
  validateUpdateMemberData,
};
