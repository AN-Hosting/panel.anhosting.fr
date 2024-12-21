import React, { useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import createServerDatabase from '@/api/server/databases/createServerDatabase';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';

interface Values {
    databaseName: string;
    connectionsFrom: string;
}

const schema = object().shape({
    databaseName: string()
        .required('Un nom de base de données doit être fourni.')
        .min(3, 'Le nom de la base de données doit comporter au moins 3 caractères.')
        .max(48, 'Le nom de la base de données ne doit pas dépasser 48 caractères.')
        .matches(
            /^[\w\-.]{3,48}$/,
            'Le nom de la base de données ne doit contenir que des caractères alphanumériques, des tirets bas, des tirets et/ou des points.'
        ),
    connectionsFrom: string().matches(/^[\w\-/.%:]+$/, 'Une adresse hôte valide doit être fournie.'),
});

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('database:create');
        createServerDatabase(uuid, {
            databaseName: values.databaseName,
            connectionsFrom: values.connectionsFrom || '%',
        })
            .then((database) => {
                appendDatabase(database);
                setVisible(false);
            })
            .catch((error) => {
                addError({ key: 'database:create', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ databaseName: '', connectionsFrom: '' }}
                validationSchema={schema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            resetForm();
                            setVisible(false);
                        }}
                    >
                        <FlashMessageRender byKey={'database:create'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl mb-6`}>Créer une nouvelle base de données</h2>
                        <Form css={tw`m-0`}>
                            <Field
                                type={'string'}
                                id={'database_name'}
                                name={'databaseName'}
                                label={'Nom de la base de données'}
                                description={'Un nom descriptif pour votre instance de base de données.'}
                            />
                            <div css={tw`mt-6`}>
                                <Field
                                    type={'string'}
                                    id={'connections_from'}
                                    name={'connectionsFrom'}
                                    label={'Connexions depuis'}
                                    description={
                                        'D\'où les connexions doivent être autorisées. Laissez vide pour autoriser les connexions de partout.'
                                    }
                                />
                            </div>
                            <div css={tw`flex flex-wrap justify-end mt-6`}>
                                <Button
                                    type={'button'}
                                    isSecondary
                                    css={tw`w-full sm:w-auto sm:mr-2`}
                                    onClick={() => setVisible(false)}
                                >
                                    Annuler
                                </Button>
                                <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'}>
                                    Créer la base de données
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Button onClick={() => setVisible(true)}>Nouvelle base de données</Button>
        </>
    );
};
