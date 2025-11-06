import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="manage accounts of  students"
        description="to this page manage accounts of students"
      />
      <PageBreadcrumb pageTitle="accounts" />
      <div className="space-y-6">
        <ComponentCard title="manage users">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
