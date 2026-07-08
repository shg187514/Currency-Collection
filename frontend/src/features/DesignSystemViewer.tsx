import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';
import { Dropdown, DropdownItem } from '../components/ui/Dropdown';
import { ContextMenu } from '../components/ui/ContextMenu';
import { Tooltip } from '../components/ui/Tooltip';
import { Tabs } from '../components/ui/Tabs';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Sidebar, SidebarItem } from '../components/ui/Sidebar';
import { useToast } from '../components/ui/Toast';

export default function DesignSystemViewer() {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <div className="flex">
      <Sidebar>
        <div className="text-xl font-bold mb-4 px-3">Components</div>
        <SidebarItem active>Design System</SidebarItem>
        <SidebarItem>Dashboard</SidebarItem>
        <SidebarItem>Settings</SidebarItem>
      </Sidebar>

      <div className="flex-1 p-8 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-8">TreeSpace Design System</h1>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Library</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Design System</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Inputs & Textarea</h2>
          <div className="grid max-w-sm gap-4">
            <Input placeholder="Default Input" />
            <Input placeholder="Error Input" error />
            <Textarea placeholder="Textarea" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Badges</h2>
          <div className="flex gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Loaders</h2>
          <div className="flex items-center gap-8">
            <Spinner size="lg" />
            <div className="w-64 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Cards</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the card content demonstrating a simple flexible card container.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Interactive</h2>
          <div className="flex flex-wrap gap-4 items-start">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
              <p>This is a custom modal built with standard React and Tailwind.</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </Modal>

            <Dropdown trigger={<Button variant="outline">Dropdown Menu</Button>}>
              <DropdownItem>Profile</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem disabled>Billing</DropdownItem>
            </Dropdown>

            <Tooltip content="This is a helpful tooltip!">
              <Button variant="secondary">Hover me</Button>
            </Tooltip>
            
            <Button onClick={() => addToast({ title: 'Success', description: 'Toast triggered successfully!', type: 'success' })}>
              Show Toast
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Tabs & Accordion</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Tabs
              tabs={[
                { label: 'Tab 1', value: '1', content: <div className="p-4 border rounded-md mt-2">Content 1</div> },
                { label: 'Tab 2', value: '2', content: <div className="p-4 border rounded-md mt-2">Content 2</div> },
              ]}
            />
            
            <Accordion>
              <AccordionItem title="Is it accessible?">
                Yes, but custom built manually.
              </AccordionItem>
              <AccordionItem title="Is it styled?">
                Yes, completely with Tailwind CSS.
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="space-y-4 pb-32">
          <h2 className="text-2xl font-semibold border-b pb-2">Context Menu</h2>
          <ContextMenu
            menu={
              <>
                <DropdownItem>Refresh</DropdownItem>
                <DropdownItem>Save As...</DropdownItem>
              </>
            }
          >
            <div className="flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700">
              Right click here
            </div>
          </ContextMenu>
        </section>

      </div>
    </div>
  );
}
