import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="morogoro teachers college signup form"
        description="morogoro teachers college signup form"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
