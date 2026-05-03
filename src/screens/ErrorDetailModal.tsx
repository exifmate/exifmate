import { Modal, toast } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import {
  ERROR_REPORTED_EVENT,
  type ErrorReport,
} from '@platform/error-reporter';
import { useCallback, useState } from 'react';

function ErrorDetailModal() {
  const [detail, setDetail] = useState<string | null>(null);

  const onReport = useCallback((report: ErrorReport) => {
    if (report.detail) {
      toast.danger(report.message, {
        actionProps: {
          variant: 'ghost',
          children: 'Details',
          onPress: () => setDetail(report.detail),
        },
      });
    } else {
      toast.danger(report.message);
    }
  }, []);

  useTauriListener<ErrorReport>(ERROR_REPORTED_EVENT, onReport);

  return (
    <Modal.Backdrop
      isOpen={detail !== null}
      onOpenChange={(open) => {
        if (!open) setDetail(null);
      }}
    >
      <Modal.Container scroll="inside" size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Error Details</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {detail}
            </pre>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

export default ErrorDetailModal;
