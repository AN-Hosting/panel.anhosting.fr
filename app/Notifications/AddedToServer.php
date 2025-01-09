<?php

namespace Pterodactyl\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AddedToServer extends Notification implements ShouldQueue
{
    use Queueable;

    public object $server;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $server)
    {
        $this->server = (object) $server;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(): MailMessage
    {
        return (new MailMessage())
            ->greeting('Bonjour ' . $this->server->user . ' !')
            ->line('Vous avez été ajouté comme sous-utilisateur au serveur suivant, vous donnant certains droits de contrôle.')
            ->line('Nom du serveur : ' . $this->server->name)
            ->action('Visiter le serveur', url('/server/' . $this->server->uuidShort));
    }
}
